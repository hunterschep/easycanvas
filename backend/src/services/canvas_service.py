from canvasapi import Canvas
from fastapi import HTTPException
import logging
from src.utils.encryption import decrypt_token
from typing import List

logger = logging.getLogger(__name__)

class CanvasService:
    @staticmethod
    def initialize_canvas(canvas_url: str, api_token: str) -> Canvas:
        try:
            canvas = Canvas(canvas_url, api_token)
            # Test connection by getting current user
            canvas.get_current_user()
            return canvas
        except Exception as e:
            logger.error(f"Failed to initialize Canvas API: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid Canvas credentials")

    @staticmethod
    def get_current_user(canvas: Canvas):
        try:
            return canvas.get_current_user()
        except Exception as e:
            logger.error(f"Failed to get current user: {str(e)}")
            raise HTTPException(status_code=400, detail="Failed to get Canvas user")

    @staticmethod
    async def get_courses(canvas: Canvas, selected_course_ids: List[int] = None):
        """
        Fetch courses from Canvas. If selected_course_ids is provided,
        only fetch those specific courses.
        """
        try:
            if selected_course_ids is None:
                # If no selected courses, return all available courses
                return [course for course in canvas.get_courses() 
                       if getattr(course, 'workflow_state', None) == 'available']
            
            # Fetch only selected courses
            courses = []
            for course_id in selected_course_ids:
                try:
                    course = canvas.get_course(course_id)
                    if getattr(course, 'workflow_state', None) == 'available':
                        courses.append(course)
                except Exception as e:
                    logger.warning(f"Failed to fetch course {course_id}: {str(e)}")
                    continue
                    
            return courses
        except Exception as e:
            logger.error(f"Failed to get courses: {str(e)}")
            raise HTTPException(status_code=400, detail="Failed to fetch Canvas courses")