from src.config.firebase import db
from src.utils.encryption import encrypt_token, decrypt_token
from canvasapi import Canvas
from google.cloud import firestore
from fastapi import HTTPException

class UserService:
    @staticmethod
    async def save_user_settings(user_id: str, settings: dict):
        try:
            encrypted_token = encrypt_token(settings.apiToken)
            canvas = Canvas(settings.canvasUrl, settings.apiToken)
            canvas_user = canvas.get_current_user()
            
            user_data = {
                'canvasUrl': settings.canvasUrl,
                'apiToken': encrypted_token,
                'canvas_user_id': canvas_user.id,
                'name': canvas_user.name,
                'first_name': canvas_user.first_name,
                'last_name': canvas_user.last_name,
                'avatar_url': canvas_user.avatar_url,
                'email': canvas_user.email if hasattr(canvas_user, 'email') else None,
                'updatedAt': firestore.SERVER_TIMESTAMP
            }
            
            doc_ref = db.collection('users').document(user_id)
            doc_ref.set(user_data)
            
            response_data = user_data.copy()
            response_data.pop('apiToken')
            return response_data
            
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))