from src.config.firebase import db
from src.utils.encryption import decrypt_token
from canvasapi import Canvas
from google.cloud import firestore
import asyncio
import logging

logger = logging.getLogger(__name__)

class CourseService:
    @staticmethod
    async def get_user_courses(user_id: str, force: bool = False):
        try:
            user_doc = db.collection('users').document(user_id).get()
            if not user_doc.exists:
                raise ValueError("User settings not found")
                
            user_data = user_doc.to_dict()
            canvas_url = user_data['canvasUrl']
            decrypted_token = decrypt_token(user_data['apiToken'])
            
            canvas = Canvas(canvas_url, decrypted_token)
            courses = []
            
            # Rest of the course fetching logic...
            
            return courses
            
        except Exception as e:
            logger.error(f"Error fetching courses: {str(e)}")
            raise