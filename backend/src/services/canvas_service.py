from canvasapi import Canvas
from fastapi import HTTPException
import logging
from src.utils.encryption import decrypt_token

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
    async def get_courses(canvas: Canvas, current_term_id: int = 7109):
        try:
            all_courses = canvas.get_courses()
            filtered_courses = []
            
            for course in all_courses:
                if (getattr(course, 'workflow_state', None) == 'available' and
                    getattr(course, 'enrollment_term_id', None) == current_term_id):
                    filtered_courses.append(course)
                    
            return filtered_courses
        except Exception as e:
            logger.error(f"Failed to get courses: {str(e)}")
            raise HTTPException(status_code=400, detail="Failed to fetch Canvas courses")