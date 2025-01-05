from src.config.firebase import db
from src.services.canvas_service import CanvasService
from src.utils.encryption import decrypt_token
from google.cloud import firestore
import logging
import asyncio
from fastapi import HTTPException
from datetime import datetime, timezone
from typing import List, Dict, Any
from canvasapi import Canvas
from src.utils.logging import setup_logger

logger = setup_logger(__name__)

def should_refresh_courses(last_updated) -> bool:
    logger.debug(f"Checking last_updated: {last_updated}")
    # If force=True from frontend or no last_updated timestamp, we should refresh
    return True if not last_updated else False

class CourseService:

    @staticmethod
    async def get_user_courses(user_id: str, force: bool = False) -> List[Dict[str, Any]]:
        try:
            logger.debug(f"Starting get_user_courses for user: {user_id}, force: {force}")
            
            # Get user settings
            user_doc = db.collection('users').document(str(user_id)).get()
            if not user_doc.exists:
                logger.error(f"User {user_id} not found in users collection")
                raise HTTPException(status_code=404, detail="User not found")

            user_data = user_doc.to_dict()
            
            # If force=True, always refresh. Otherwise, check cache
            if not force:
                logger.debug("Checking cache first")
                cached_courses = await CourseService._get_cached_courses(user_id)
                if cached_courses:
                    return cached_courses
            
            logger.info("Fetching fresh courses from Canvas")
            
            # Initialize Canvas
            canvas_url = user_data.get('canvasUrl')
            encrypted_token = user_data.get('apiToken')
            logger.debug(f"Canvas URL: {canvas_url}")
            
            if not canvas_url or not encrypted_token:
                logger.error("Missing Canvas credentials")
                raise HTTPException(status_code=400, detail="Canvas credentials not found")
            
            try:
                decrypted_token = decrypt_token(encrypted_token)
                canvas = Canvas(canvas_url, decrypted_token)
                current_user = canvas.get_current_user()
                logger.debug(f"Successfully connected to Canvas as user: {current_user.name}")
            except Exception as e:
                logger.error(f"Canvas initialization failed: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to connect to Canvas: {str(e)}")
            
            # Get selected course IDs
            selected_course_ids = await CourseService.get_selected_courses(user_id)
            
            # Fetch courses
            try:
                all_courses = canvas.get_courses()
                course_tasks = []
                
                for course in all_courses:
                    is_available = getattr(course, 'workflow_state', None) == 'available'
                    is_selected = course.id in selected_course_ids
                    has_active_enrollment = any(
                        enrollment.get('enrollment_state') == 'active' and 
                        enrollment.get('type') in ['student', 'teacher', 'ta']
                        for enrollment in getattr(course, 'enrollments', [])
                    )
                    
                    if is_available and has_active_enrollment and is_selected:
                        task = CourseService._process_course(course, canvas, user_data['canvas_user_id'])
                        course_tasks.append(task)
                
                # Process all courses concurrently
                courses = await asyncio.gather(*course_tasks)
                # Filter out None values (failed course processing)
                courses = [course for course in courses if course]
                
                if courses:
                    logger.info(f"Successfully processed {len(courses)} courses")
                    await CourseService._save_courses_to_firestore(user_id, courses)
                    return courses
                else:
                    logger.warning("No valid courses found to process")
                    return []
                    
            except Exception as e:
                logger.error(f"Course processing failed: {str(e)}")
                raise HTTPException(status_code=500, detail="Failed to process courses")
            
        except Exception as e:
            logger.error(f"Unhandled exception in get_user_courses: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    async def _process_course(course, canvas, canvas_user_id: int) -> Dict[str, Any]:
        logger.debug(f"Processing course: {course.name} (ID: {course.id})")
        course_data = {
            'id': course.id,
            'name': course.name,
            'code': course.course_code,
            'assignments': [],
            'term': getattr(course, 'enrollment_term_id', None),
            'start_at': getattr(course, 'start_at', None),
            'end_at': getattr(course, 'end_at', None),
            'time_zone': getattr(course, 'time_zone', 'UTC'),
            'homepage': None  # Default to None
        }
        
        # Try to fetch the front page
        try:
            front_page = course.show_front_page()
            if front_page:
                course_data['homepage'] = front_page.body
                logger.debug(f"Successfully fetched homepage for course {course.name}")
        except Exception as e:
            logger.debug(f"No homepage found for course {course.name}: {str(e)}")
        
        try:
            assignments = course.get_assignments()
            assignment_tasks = []
            
            for assignment in assignments:
                if getattr(assignment, 'published', True):
                    task = CourseService._process_assignment(assignment, canvas_user_id)
                    assignment_tasks.append(task)
            
            # Process all assignments concurrently
            processed_assignments = await asyncio.gather(*assignment_tasks)
            course_data['assignments'] = [a for a in processed_assignments if a]  # Filter out None values
            logger.debug(f"Successfully processed {len(course_data['assignments'])} assignments for course {course.name}")
                
        except Exception as e:
            logger.error(f"Error processing assignments for course {course.id}: {str(e)}")
        
        return course_data

    @staticmethod
    async def _process_assignment(assignment, canvas_user_id: int) -> Dict[str, Any]:
        assignment_data = {
            'id': assignment.id,
            'name': assignment.name,
            'description': getattr(assignment, 'description', None),
            'due_at': getattr(assignment, 'due_at', None),
            'points_possible': getattr(assignment, 'points_possible', 0),
            'submission_types': getattr(assignment, 'submission_types', []),
            'html_url': getattr(assignment, 'html_url', None),
            'lock_at': getattr(assignment, 'lock_at', None),
            'course_id': assignment.course_id
        }

        try:
            if assignment.has_submitted_submissions:
                submission = assignment.get_submission(canvas_user_id)
                assignment_data['grade'] = str(submission.score) if submission and submission.score is not None else 'N/A'
            else:
                assignment_data['grade'] = 'N/A'
        except Exception as e:
            logger.error(f"Error fetching submission for assignment {assignment.id}: {str(e)}")
            assignment_data['grade'] = 'N/A'

        return assignment_data

    @staticmethod
    async def _save_courses_to_firestore(user_id: str, courses: List[Dict[str, Any]]):
        try:
            logger.debug(f"Attempting to save {len(courses)} courses for user {user_id}")
            
            # Create the document in userCourses collection
            doc_ref = db.collection('userCourses').document(user_id)
            
            # Prepare the data
            data = {
                'courses': courses,
                'lastUpdated': firestore.SERVER_TIMESTAMP
            }
            
            # Set the document with merge=True to create if it doesn't exist
            doc_ref.set(data, merge=True)
            
            # Verify the save
            saved_doc = doc_ref.get()
            if saved_doc.exists:
                saved_data = saved_doc.to_dict()
                logger.info(f"Successfully saved {len(saved_data.get('courses', []))} courses to Firestore")
            else:
                logger.error("Failed to verify saved courses document")
                raise Exception("Failed to verify saved courses")
                
        except Exception as e:
            logger.error(f"Failed to save courses to Firestore: {str(e)}")
            raise e

    @staticmethod
    async def _get_cached_courses(user_id: str) -> List[Dict[str, Any]]:
        try:
            logger.info(f"[Cache] Attempting to retrieve cached courses for user: {user_id}")
            doc_ref = db.collection('userCourses').document(user_id)
            doc = doc_ref.get()
            
            if doc.exists:
                data = doc.to_dict()
                courses = data.get('courses', [])
                logger.info(f"[Cache] Found {len(courses)} cached courses")
                return courses
            
            logger.info("[Cache] No cached courses found")
            return []
            
        except Exception as e:
            logger.error(f"[Error] Failed to retrieve cached courses: {str(e)}")
            return []

    @staticmethod
    async def get_courses_last_updated(user_id: str):
        try:
            doc_ref = db.collection('userCourses').document(user_id)
            doc = doc_ref.get()
            
            if not doc.exists:
                return {"lastUpdated": None}
            
            data = doc.to_dict()
            timestamp = data.get('lastUpdated')
            logger.debug(f"Raw Firebase Timestamp: {timestamp}")
            
            if timestamp:
                # Convert to epoch seconds
                return {
                    "lastUpdated": {
                        "seconds": int(timestamp.timestamp()),  # Convert to Unix timestamp (seconds)
                        "nanoseconds": timestamp.nanosecond  # Get nanoseconds
                    }
                }
            
            return {"lastUpdated": None}
        except Exception as e:
            logger.error(f"Error in get_courses_last_updated: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    async def save_selected_courses(user_id: str, course_ids: List[int]):
        try:
            # Save selected course IDs to user document
            doc_ref = db.collection('users').document(user_id)
            doc_ref.set({
                'selected_course_ids': course_ids
            }, merge=True)
            logger.info(f"Saved selected courses for user {user_id}: {course_ids}")
            return True
        except Exception as e:
            logger.error(f"Failed to save selected courses: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to save selected courses")

    @staticmethod
    async def get_selected_courses(user_id: str) -> List[int]:
        try:
            doc = db.collection('users').document(user_id).get()
            if doc.exists:
                user_data = doc.to_dict()
                return user_data.get('selected_course_ids', [])
            return []
        except Exception as e:
            logger.error(f"Failed to get selected courses: {str(e)}")
            return []

    @staticmethod
    async def get_available_courses(user_id: str) -> List[Dict[str, Any]]:
        """Get all available courses for selection"""
        try:
            user_data = await CourseService._get_user_data(user_id)
            canvas = await CourseService._get_canvas_instance(user_data)
            
            courses = []
            for course in canvas.get_courses():
                is_available = getattr(course, 'workflow_state', None) == 'available'
                has_active_enrollment = any(
                    enrollment.get('enrollment_state') == 'active' and 
                    enrollment.get('type') in ['student', 'teacher', 'ta']
                    for enrollment in getattr(course, 'enrollments', [])
                )
                
                if is_available and has_active_enrollment:
                    courses.append({
                        'id': course.id,
                        'name': course.name,
                        'code': course.course_code,
                        'term': getattr(course, 'enrollment_term_id', None),
                        'start_at': getattr(course, 'start_at', None),
                        'end_at': getattr(course, 'end_at', None)
                    })
            
            return courses
        except Exception as e:
            logger.error(f"Error getting available courses: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

    @staticmethod
    async def _get_user_data(user_id: str) -> Dict[str, Any]:
        """Get user data from Firestore"""
        doc = db.collection('users').document(str(user_id)).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_data = doc.to_dict()
        if not user_data.get('canvasUrl') or not user_data.get('apiToken'):
            raise HTTPException(status_code=400, detail="Canvas integration not configured")
        
        return user_data

    @staticmethod
    async def _get_canvas_instance(user_data: Dict[str, Any]) -> Canvas:
        """Initialize Canvas instance with decrypted token"""
        try:
            canvas_url = user_data.get('canvasUrl')
            encrypted_token = user_data.get('apiToken')
            
            if not canvas_url or not encrypted_token:
                raise HTTPException(status_code=400, detail="Canvas credentials not found")
            
            decrypted_token = decrypt_token(encrypted_token)
            canvas = Canvas(canvas_url, decrypted_token)
            # Test connection
            canvas.get_current_user()
            return canvas
        except Exception as e:
            logger.error(f"Canvas initialization failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to connect to Canvas: {str(e)}")