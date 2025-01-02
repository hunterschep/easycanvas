from src.config.firebase import db
from src.services.canvas_service import CanvasService
from src.utils.encryption import decrypt_token
from google.cloud import firestore
import logging
import asyncio

logger = logging.getLogger(__name__)

class CourseService:
    def __init__(self):
        self.canvas_service = CanvasService()

    async def get_user_courses(self, user_id: str, force: bool = False):
        try:
            # Get user settings from Firestore
            user_doc = db.collection('users').document(user_id).get()
            if not user_doc.exists:
                raise ValueError("User settings not found")
                
            user_data = user_doc.to_dict()
            canvas_url = user_data.get('canvasUrl')
            encrypted_token = user_data.get('apiToken')
            
            if not canvas_url or not encrypted_token:
                raise ValueError("Missing Canvas URL or API token")
                
            # Initialize Canvas
            decrypted_token = decrypt_token(encrypted_token)
            canvas = self.canvas_service.initialize_canvas(canvas_url, decrypted_token)
            
            # Get courses
            courses = await self.canvas_service.get_courses(canvas)
            processed_courses = await self._process_courses(canvas, courses, user_id)
            
            # Save to Firestore
            await self._save_courses_to_firestore(user_id, processed_courses)
            
            return processed_courses
            
        except Exception as e:
            logger.error(f"Error in get_user_courses: {str(e)}")
            raise

    async def _process_courses(self, canvas, courses, user_id):
        processed_courses = []
        for course in courses:
            course_data = await self._process_single_course(canvas, course, user_id)
            if course_data:
                processed_courses.append(course_data)
            await asyncio.sleep(0.2)  # Rate limiting
        return processed_courses

    async def _save_courses_to_firestore(self, user_id: str, courses: list):
        doc_ref = db.collection('userCourses').document(user_id)
        doc_ref.set({
            'courses': courses,
            'lastUpdated': firestore.SERVER_TIMESTAMP
        })