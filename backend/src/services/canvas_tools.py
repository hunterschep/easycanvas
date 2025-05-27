from typing import List, Dict, Any, Optional
import json
from datetime import datetime, timedelta, timezone
from src.services.firestore_service import FirestoreService
from src.services.course_service import CourseService
from src.services.user_service import UserService
import logging

# Get logger
logger = logging.getLogger(__name__)

class CanvasTools:
    """Tools for accessing Canvas data from the chatbot"""

    @staticmethod
    async def get_courses(user_id: str) -> str:
        """Get a list of the user's Canvas courses"""
        try:
            # Get courses from Firebase (already fetched from Canvas)
            courses = await CourseService._get_cached_courses(user_id)
            
            # Format the courses for display
            course_list = []
            for course in courses:
                course_list.append({
                    "id": course["id"],
                    "name": course["name"],
                    "code": course["code"],
                })
            
            return json.dumps(course_list)
        except Exception as e:
            logger.error(f"Error in get_courses: {str(e)}", exc_info=True)
            return json.dumps({"error": f"Failed to retrieve courses: {str(e)}"})
    

    @staticmethod
    async def get_assignments(user_id: str, course_id: Optional[int] = None, days_due: Optional[int] = None) -> str:
        """
        Get assignments for a specific course or all courses
        
        Args:
            user_id: User ID
            course_id: Optional course ID to filter assignments
            days_due: Optional number of days to filter assignments due within
        """
        try:
            # Get courses from Firebase
            courses = await CourseService._get_cached_courses(user_id)
            
            assignments_list = []
            now = datetime.now(timezone.utc)  # Use timezone-aware datetime
            
            for course in courses:
                # Filter by course_id if provided
                if course_id is not None and course["id"] != course_id:
                    continue
                
                for assignment in course["assignments"]:
                    # Create a minimal assignment object with only essential fields
                    assignment_summary = {
                        "id": assignment.get("id"),
                        "name": assignment.get("name"),
                        "due_at": assignment.get("due_at"),
                        "points_possible": assignment.get("points_possible"),
                        "course_id": assignment.get("course_id"),
                        "course_name": course["name"],
                        "course_code": course["code"],
                        "published": assignment.get("published"),
                        "submission_types": assignment.get("submission_types"),
                        "html_url": assignment.get("html_url"),
                        "has_submitted_submissions": assignment.get("has_submitted_submissions")
                    }
                    
                    # Filter by due date if days_due is provided
                    if days_due is not None and assignment.get("due_at"):
                        try:
                            # Parse the due date, ensuring it's timezone-aware
                            due_date_str = assignment["due_at"]
                            if due_date_str.endswith('Z'):
                                # Convert 'Z' format to +00:00 format
                                due_date_str = due_date_str.replace('Z', '+00:00')
                            
                            due_date = datetime.fromisoformat(due_date_str)
                            
                            # Ensure the datetime is timezone-aware
                            if due_date.tzinfo is None:
                                logger.warning(f"Assignment due date is not timezone-aware: {due_date_str}")
                                due_date = due_date.replace(tzinfo=timezone.utc)
                            
                            # Calculate days until due
                            days_until_due = (due_date - now).days
                            
                            if days_until_due < 0 or days_until_due > days_due:
                                continue
                        except Exception as e:
                            logger.error(f"Error parsing due date '{assignment.get('due_at')}': {str(e)}")
                            # Include the assignment anyway if we can't parse the date
                    
                    assignments_list.append(assignment_summary)
            
            # Sort assignments by due date
            try:
                assignments_list.sort(
                    key=lambda a: datetime.fromisoformat(
                        a["due_at"].replace('Z', '+00:00') if a.get("due_at") and a["due_at"].endswith('Z')
                        else a.get("due_at", "9999-12-31T23:59:59+00:00")
                    ) if a.get("due_at") else datetime.max.replace(tzinfo=timezone.utc)
                )
                
            except Exception as e:
                logger.error(f"Error sorting assignments: {str(e)}")
                # If sorting fails, return unsorted list
            
            logger.info(f"Found {len(assignments_list)} assignments matching criteria")
            return json.dumps(assignments_list)
        except Exception as e:
            logger.error(f"Error in get_assignments: {str(e)}", exc_info=True)
            return json.dumps({"error": f"Failed to retrieve assignments: {str(e)}"})

    @staticmethod
    async def get_upcoming_due_dates(user_id: str, days: int = 7) -> str:
        """
        Get assignments due in the next specified number of days
        
        Args:
            user_id: User ID
            days: Number of days to look ahead (default: 7)
        """
        try:
            logger.info(f"Looking for assignments due in the next {days} days")
            # Reuse the get_assignments function with days_due filter
            return await CanvasTools.get_assignments(user_id, days_due=days)
        except Exception as e:
            logger.error(f"Error in get_upcoming_due_dates: {str(e)}", exc_info=True)
            return json.dumps({"error": f"Failed to retrieve upcoming due dates: {str(e)}"})

    @staticmethod
    async def get_announcements(user_id: str, course_id: Optional[int] = None, limit: int = 10) -> str:
        """
        Get recent announcements from courses
        
        Args:
            user_id: User ID
            course_id: Optional course ID to filter announcements
            limit: Maximum number of announcements to return (default: 10)
        """
        try:
            # Get courses from Firebase
            courses = await CourseService._get_cached_courses(user_id)
            
            announcements_list = []
            
            for course in courses:
                # Filter by course_id if provided
                if course_id is not None and course["id"] != course_id:
                    continue
                
                for announcement in course.get("announcements", []):
                    # Add course information to each announcement
                    announcement_with_course = announcement.copy()
                    announcement_with_course["course_name"] = course["name"]
                    announcement_with_course["course_code"] = course["code"]
                    announcements_list.append(announcement_with_course)
            
            # Sort announcements by posted_at date (newest first)
            try:
                announcements_list.sort(
                    key=lambda a: datetime.fromisoformat(
                        a["posted_at"].replace('Z', '+00:00') if a["posted_at"].endswith('Z') 
                        else a["posted_at"]
                    ),
                    reverse=True
                )
            except Exception as e:
                logger.error(f"Error sorting announcements: {str(e)}")
                # If sorting fails, return unsorted list
            
            # Limit the number of announcements
            announcements_list = announcements_list[:limit]
            
            return json.dumps(announcements_list)
        except Exception as e:
            logger.error(f"Error in get_announcements: {str(e)}", exc_info=True)
            return json.dumps({"error": f"Failed to retrieve announcements: {str(e)}"})

    @staticmethod
    async def get_assignment(user_id: str, assignment_id: int, course_id: Optional[int] = None) -> str:
        """
        Get detailed information for a specific assignment
        
        Args:
            user_id: User ID
            assignment_id: Assignment ID
            course_id: Optional course ID to narrow the search
        """
        try:
            # Get courses from Firebase
            courses = await CourseService._get_cached_courses(user_id)
            
            # Search for the assignment
            for course in courses:
                # Filter by course_id if provided
                if course_id is not None and course["id"] != course_id:
                    continue
                
                for assignment in course["assignments"]:
                    if assignment.get("id") == assignment_id:
                        # Add course information to the assignment
                        assignment_with_course = assignment.copy()
                        assignment_with_course["course_name"] = course["name"]
                        assignment_with_course["course_code"] = course["code"]
                        
                        return json.dumps(assignment_with_course)
            
            # Assignment not found
            return json.dumps({"error": f"Assignment with ID {assignment_id} not found"})
        except Exception as e:
            logger.error(f"Error in get_assignment: {str(e)}", exc_info=True)
            return json.dumps({"error": f"Failed to retrieve assignment: {str(e)}"})

    @staticmethod
    async def get_course_modules(user_id: str, course_id: int) -> str:
        """
        Get modules for a specific course
        
        Args:
            user_id: User ID
            course_id: Course ID
        """
        try:
            # Get courses from Firebase
            courses = await CourseService._get_cached_courses(user_id)
            
            # Find the specified course
            course = next((c for c in courses if c["id"] == course_id), None)
            if not course:
                return json.dumps({"error": f"Course with ID {course_id} not found"})
            
            # Extract modules
            modules = course.get("modules", [])
            
            return json.dumps(modules)
        except Exception as e:
            logger.error(f"Error in get_course_modules: {str(e)}", exc_info=True)
            return json.dumps({"error": f"Failed to retrieve course modules: {str(e)}"})

    @staticmethod
    async def get_module_items(user_id: str, course_id: int, module_id: int) -> str:
        """
        Get items for a specific module in a course
        
        Args:
            user_id: User ID
            course_id: Course ID
            module_id: Module ID
        """
        try:
            # Get user data for Canvas instance
            user_data = await CourseService._get_user_data(user_id)
            canvas = await CourseService._get_canvas_instance(user_data)
            
            # Get module items
            items = await CourseService.get_module_items(canvas, course_id, module_id)
            
            # Convert to serializable format
            items_list = [item.dict() for item in items]
            
            return json.dumps(items_list)
        except Exception as e:
            logger.error(f"Error in get_module_items: {str(e)}", exc_info=True)
            return json.dumps({"error": f"Failed to retrieve module items: {str(e)}"})

    @staticmethod
    async def get_user_info(user_id: str) -> str:
        """Get basic information about the user"""
        try:
            user_data = await UserService.get_user_settings(user_id)
            # remove canvas_user_id from user_data
            user_data.pop('canvas_user_id', None)
            
            return json.dumps(user_data)
        except Exception as e:
            logger.error(f"Error in get_user_info: {str(e)}", exc_info=True)
            return json.dumps({"error": f"Failed to retrieve user information: {str(e)}"}) 