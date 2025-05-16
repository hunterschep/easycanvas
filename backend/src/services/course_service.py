from src.config.firebase import db
from src.services.canvas_service import CanvasService
from src.utils.encryption import decrypt_token
from google.cloud import firestore
import logging
import asyncio
from fastapi import HTTPException
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from canvasapi import Canvas
from src.utils.logging import setup_logger
from src.models.course import ModuleItem

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
            'modules': [],
            'term': getattr(course, 'enrollment_term_id', None),
            'start_at': getattr(course, 'start_at', None),
            'end_at': getattr(course, 'end_at', None),
            'time_zone': getattr(course, 'time_zone', 'UTC'),
        }
        
        try:
            # Process assignments
            assignments = course.get_assignments()
            assignment_tasks = []
            for assignment in assignments:
                if getattr(assignment, 'published', True):
                    task = CourseService._process_assignment(assignment, canvas_user_id)
                    assignment_tasks.append(task)
            
            # Process modules with items included
            logger.info(f"Fetching modules with items for course {course.id}")
            modules_list = []
            module_tasks = []
            
            try:
                # Get modules with items included using the include[] parameter
                modules = course.get_modules(include=['items'])
                
                # Convert PaginatedList to a regular list to avoid consuming it twice
                for module in modules:
                    modules_list.append(module)
                
                logger.info(f"Found {len(modules_list)} modules for course {course.name}")
                
                for module in modules_list:
                    if getattr(module, 'workflow_state', 'active') == 'active':
                        task = CourseService._process_module_with_items(module)
                        module_tasks.append(task)
            except Exception as e:
                logger.error(f"Error fetching modules with items for course {course.id}: {str(e)}")
                
                # Fallback to standard modules
                modules = course.get_modules()
                modules_list = []
                
                # Clear previous tasks
                module_tasks = []
                
                # Convert PaginatedList to a regular list
                for module in modules:
                    modules_list.append(module)
                
                logger.info(f"Falling back to standard modules. Found {len(modules_list)} modules for course {course.name}")
                
                for module in modules_list:
                    if getattr(module, 'workflow_state', 'active') == 'active':
                        task = CourseService._process_module(module)
                        module_tasks.append(task)
            
            # Process announcements
            logger.info(f"Fetching announcements for course {course.id}")
            try:
                # Call get_announcements with explicit pagination parameters and date filtering
                # The method returns a PaginatedList which we need to iterate to get all items
                announcements_list = canvas.get_announcements(
                    context_codes=[f"course_{course.id}"],
                    per_page=50,  # Get more items per page
                    # Set a reasonable date range - can be adjusted as needed
                    start_date=(datetime.now(timezone.utc) - timedelta(days=180)).strftime('%Y-%m-%d'),
                    end_date=datetime.now(timezone.utc).strftime('%Y-%m-%d'),
                    active_only=True  # Only get active announcements
                )
                
                # Get all announcements from all pages
                all_announcements = []
                for announcement in announcements_list:
                    all_announcements.append(announcement)
                    logger.debug(f"Found announcement: {getattr(announcement, 'title', 'No title')}")
                
                logger.info(f"Found {len(all_announcements)} announcements for course {course.name}")
                course_data['announcements'] = await CourseService._process_announcements(all_announcements)
                logger.info(f"Successfully processed {len(course_data['announcements'])} announcements for course {course.name}")
            except Exception as e:
                logger.error(f"Error processing announcements for course {course.id}: {str(e)}")
                course_data['announcements'] = []
            
            # Process all tasks concurrently
            processed_assignments = await asyncio.gather(*assignment_tasks)
            processed_modules = await asyncio.gather(*module_tasks)
            
            course_data['assignments'] = [a for a in processed_assignments if a]
            course_data['modules'] = [m for m in processed_modules if m]
            
            logger.debug(f"Successfully processed {len(course_data['assignments'])} assignments and {len(course_data['modules'])} modules for course {course.name}")
                
        except Exception as e:
            logger.error(f"Error processing course {course.id}: {str(e)}")
        
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
            'has_submitted_submissions': getattr(assignment, 'has_submitted_submissions', False),
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
        """Get user data from Firestore."""
        user_doc = db.collection('users').document(str(user_id)).get()
        if not user_doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
        return user_doc.to_dict()

    @staticmethod
    async def _get_canvas_instance(user_data: Dict[str, Any]) -> Canvas:
        """Initialize Canvas instance from user data."""
        canvas_url = user_data.get('canvasUrl')
        encrypted_token = user_data.get('apiToken')
        
        if not canvas_url or not encrypted_token:
            raise HTTPException(status_code=400, detail="Canvas credentials not found")
        
        try:
            decrypted_token = decrypt_token(encrypted_token)
            canvas = Canvas(canvas_url, decrypted_token)
            return canvas
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to connect to Canvas: {str(e)}")

    @staticmethod
    async def _process_module(module) -> Dict[str, Any]:
        logger.debug(f"Processing module: {module.name} (ID: {module.id})")
        module_data = {
            'id': module.id,
            'name': module.name,
            'position': getattr(module, 'position', 0),
            'unlock_at': getattr(module, 'unlock_at', None),
            'workflow_state': getattr(module, 'workflow_state', 'active'),
            'state': getattr(module, 'state', None),
            'completed_at': getattr(module, 'completed_at', None),
            'require_sequential_progress': getattr(module, 'require_sequential_progress', False),
            'published': getattr(module, 'published', True),
            'items_count': getattr(module, 'items_count', 0),
            'items_url': getattr(module, 'items_url', None),
            'prerequisite_module_ids': getattr(module, 'prerequisite_module_ids', []),
            'items': []  # Empty items array for consistency with _process_module_with_items
        }
        
        # Also fetch module items separately for consistency
        try:
            logger.debug(f"Fetching items separately for module {module.name}")
            items = module.get_module_items()
            
            # Safer way to check if there are items
            first_item = None
            try:
                module_items = list(items)
                if module_items:
                    first_item = module_items[0]
                logger.debug(f"Items type: {type(items)}, first item type: {type(first_item) if first_item else 'No items'}")
                
                for item in module_items:
                    try:
                        # Check if item is a dict or an object
                        if isinstance(item, dict):
                            logger.debug(f"Processing item as dict: {item.get('title', 'No title')}")
                            item_data = {
                                'id': item.get('id'),
                                'title': item.get('title', 'No title'),
                                'position': item.get('position', 0),
                                'indent': item.get('indent', 0),
                                'type': item.get('type'),
                                'module_id': item.get('module_id', module.id),
                                'html_url': item.get('html_url'),
                                'content_id': item.get('content_id'),
                                'url': item.get('url'),
                                'completion_requirement': item.get('completion_requirement')
                            }
                        else:
                            logger.debug(f"Processing item as object: {getattr(item, 'title', 'No title')}")
                            item_data = {
                                'id': item.id,
                                'title': getattr(item, 'title', 'No title'),
                                'position': getattr(item, 'position', 0),
                                'indent': getattr(item, 'indent', 0),
                                'type': getattr(item, 'type', None),
                                'module_id': getattr(item, 'module_id', module.id),
                                'html_url': getattr(item, 'html_url', None),
                                'content_id': getattr(item, 'content_id', None),
                                'url': getattr(item, 'url', None),
                                'completion_requirement': getattr(item, 'completion_requirement', None)
                            }
                        module_data['items'].append(item_data)
                    except Exception as e:
                        logger.error(f"Error processing individual item in module {module.id}: {str(e)}")
            except Exception as e:
                logger.error(f"Error converting items to list: {str(e)}")
            
            logger.debug(f"Fetched {len(module_data['items'])} items separately for module {module.name}")
        except Exception as e:
            logger.error(f"Error fetching items separately for module {module.id}: {str(e)}")
        
        return module_data

    @staticmethod
    async def get_module_items(canvas: Canvas, course_id: int, module_id: int) -> List[ModuleItem]:
        """Fetch and process items for a specific module."""
        try:
            course = canvas.get_course(course_id)
            module = course.get_module(module_id)
            items = module.get_module_items()
            
            processed_items = []
            for item in items:
                try:
                    # Create a ModuleItem with default values where needed
                    processed_item = ModuleItem(
                        id=item.id,
                        title=getattr(item, 'title', 'No title'),
                        position=getattr(item, 'position', 0),
                        indent=getattr(item, 'indent', 0),
                        type=getattr(item, 'type', None),
                        module_id=module_id,
                        html_url=getattr(item, 'html_url', None),
                        content_id=getattr(item, 'content_id', None),
                        url=getattr(item, 'url', None),
                        completion_requirement=getattr(item, 'completion_requirement', None)
                    )
                    processed_items.append(processed_item)
                except Exception as e:
                    logger.error(f"Error processing individual module item: {str(e)}")
                
            return processed_items
        except Exception as e:
            logger.error(f"Error processing module items: {str(e)}")
            raise

    @staticmethod
    async def _process_announcements(announcements) -> List[Dict[str, Any]]:
        """Process announcements for a course."""
        processed_announcements = []
        try:
            for announcement in announcements:
                announcement_data = {
                    'id': announcement.id,
                    'title': announcement.title,
                    'message': getattr(announcement, 'message', None),
                    'posted_at': getattr(announcement, 'posted_at', None),
                    'url': getattr(announcement, 'html_url', None),
                }
                processed_announcements.append(announcement_data)
            return processed_announcements
        except Exception as e:
            logger.error(f"Error processing announcements: {str(e)}")
            return []

    @staticmethod
    async def _process_module_with_items(module) -> Dict[str, Any]:
        logger.debug(f"Processing module with items: {module.name} (ID: {module.id})")
        module_data = {
            'id': module.id,
            'name': module.name,
            'position': getattr(module, 'position', 0),
            'unlock_at': getattr(module, 'unlock_at', None),
            'workflow_state': getattr(module, 'workflow_state', 'active'),
            'state': getattr(module, 'state', None),
            'completed_at': getattr(module, 'completed_at', None),
            'require_sequential_progress': getattr(module, 'require_sequential_progress', False),
            'published': getattr(module, 'published', True),
            'items_count': getattr(module, 'items_count', 0),
            'items_url': getattr(module, 'items_url', None),
            'prerequisite_module_ids': getattr(module, 'prerequisite_module_ids', []),
            'items': []
        }
        
        # Process items if they're included with the module
        if hasattr(module, 'items') and module.items:
            try:
                items = module.items
                
                # Log the type of items structure
                first_item = None
                module_items = []
                
                try:
                    # Handle items whether it's a list, tuple, or other iterable
                    if isinstance(items, (list, tuple)):
                        module_items = items
                    else:
                        module_items = list(items)
                    
                    if module_items:
                        first_item = module_items[0]
                    
                    logger.debug(f"Module items type: {type(items)}, items count: {len(module_items)}, first item type: {type(first_item) if first_item else 'No items'}")
                    
                    if first_item:
                        logger.debug(f"First item structure: {first_item}")
                except Exception as e:
                    logger.error(f"Error converting module.items to list: {str(e)}")
                
                for item in module_items:
                    try:
                        # Check if item is a dict or an object
                        if isinstance(item, dict):
                            logger.debug(f"Processing item as dict: {item.get('title', 'No title')}")
                            item_data = {
                                'id': item.get('id'),
                                'title': item.get('title', 'No title'),
                                'position': item.get('position', 0),
                                'indent': item.get('indent', 0),
                                'type': item.get('type'),
                                'module_id': item.get('module_id', module.id),
                                'html_url': item.get('html_url'),
                                'content_id': item.get('content_id'),
                                'url': item.get('url'),
                                'completion_requirement': item.get('completion_requirement')
                            }
                        else:
                            logger.debug(f"Processing item as object: {getattr(item, 'title', 'No title')}")
                            item_data = {
                                'id': item.id,
                                'title': getattr(item, 'title', 'No title'),
                                'position': getattr(item, 'position', 0),
                                'indent': getattr(item, 'indent', 0),
                                'type': getattr(item, 'type', None),
                                'module_id': getattr(item, 'module_id', module.id),
                                'html_url': getattr(item, 'html_url', None),
                                'content_id': getattr(item, 'content_id', None),
                                'url': getattr(item, 'url', None),
                                'completion_requirement': getattr(item, 'completion_requirement', None)
                            }
                        module_data['items'].append(item_data)
                    except Exception as e:
                        logger.error(f"Error processing individual item in module {module.id}: {str(e)}")
                
                logger.debug(f"Processed {len(module_data['items'])} items for module {module.name}")
            except Exception as e:
                logger.error(f"Error processing items for module {module.id}: {str(e)}")
                # Log the structure of module.items to diagnose the issue
                try:
                    if hasattr(module, 'items'):
                        logger.debug(f"Module.items raw: {module.items}")
                except Exception as log_err:
                    logger.error(f"Error logging module.items: {str(log_err)}")
        else:
            # If items aren't included, try fetching them separately
            logger.debug(f"No items included with module {module.name}, fetching separately")
            try:
                items = module.get_module_items()
                
                # Safely convert to list
                module_items = []
                try:
                    module_items = list(items)
                except Exception as e:
                    logger.error(f"Error converting module items to list: {str(e)}")
                
                for item in module_items:
                    try:
                        # Check if item is a dict or an object
                        if isinstance(item, dict):
                            logger.debug(f"Processing item as dict: {item.get('title', 'No title')}")
                            item_data = {
                                'id': item.get('id'),
                                'title': item.get('title', 'No title'),
                                'position': item.get('position', 0),
                                'indent': item.get('indent', 0),
                                'type': item.get('type'),
                                'module_id': item.get('module_id', module.id),
                                'html_url': item.get('html_url'),
                                'content_id': item.get('content_id'),
                                'url': item.get('url'),
                                'completion_requirement': item.get('completion_requirement')
                            }
                        else:
                            logger.debug(f"Processing item as object: {getattr(item, 'title', 'No title')}")
                            item_data = {
                                'id': item.id,
                                'title': getattr(item, 'title', 'No title'),
                                'position': getattr(item, 'position', 0),
                                'indent': getattr(item, 'indent', 0),
                                'type': getattr(item, 'type', None),
                                'module_id': getattr(item, 'module_id', module.id),
                                'html_url': getattr(item, 'html_url', None),
                                'content_id': getattr(item, 'content_id', None),
                                'url': getattr(item, 'url', None),
                                'completion_requirement': getattr(item, 'completion_requirement', None)
                            }
                        module_data['items'].append(item_data)
                    except Exception as e:
                        logger.error(f"Error processing individual item in module {module.id}: {str(e)}")
                
                logger.debug(f"Fetched {len(module_data['items'])} items separately for module {module.name}")
            except Exception as e:
                logger.error(f"Error fetching items separately for module {module.id}: {str(e)}")
        
        return module_data