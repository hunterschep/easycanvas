from fastapi import FastAPI, HTTPException, Depends, Header  # Add Header here
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin import auth
from pydantic import BaseModel
from typing import Optional
from firebase_admin_config import db
from canvasapi import Canvas
from google.cloud import firestore  # Add this for SERVER_TIMESTAMP
import logging

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Base endpoint response 
@app.get("/")
def read_root():
    return {"message": "Welcome to EasyCanvas Backend"}

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input model for user settings
class UserSettings(BaseModel):
    canvasUrl: str
    apiToken: str

# Output model for user data
class UserData(BaseModel):
    canvasUrl: str
    canvas_user_id: int
    name: str
    first_name: str
    last_name: str
    avatar_url: str
    email: Optional[str] = None

# Verify that Firebase access is allowed 
async def verify_firebase_token(authorization: str = Header(...)):
    try:
        token = authorization.split("Bearer ")[1]
        decoded_token = auth.verify_id_token(token)
        return decoded_token['uid']
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authentication")

# Validate CanvasAPI token and set initial user settings 
@app.post("/api/user/settings", response_model=UserData)
async def save_user_settings(
    settings: UserSettings,
    user_id: str = Depends(verify_firebase_token)
):
    try:
        # Validate Canvas API token and get user info
        canvas = Canvas(settings.canvasUrl, settings.apiToken)
        canvas_user = canvas.get_current_user()

        # Extract user details from Canvas response
        user_data = {
            'canvasUrl': settings.canvasUrl,
            'apiToken': settings.apiToken,
            'canvas_user_id': canvas_user.id,
            'name': canvas_user.name,
            'first_name': canvas_user.first_name,
            'last_name': canvas_user.last_name,
            'avatar_url': canvas_user.avatar_url,
            'email': canvas_user.email if hasattr(canvas_user, 'email') else None,
            'updatedAt': firestore.SERVER_TIMESTAMP
        }

        # Save to Firestore
        doc_ref = db.collection('users').document(user_id)
        doc_ref.set(user_data)

        # Return response (excluding apiToken)
        response_data = user_data.copy()
        response_data.pop('apiToken')
        return response_data

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Get user settings from Firestore
@app.get("/api/user/settings", response_model=UserData)
async def get_user_settings(
    user_id: str = Depends(verify_firebase_token)
):
    try:
        logger.info(f"Fetching settings for user: {user_id}")
        doc_ref = db.collection('users').document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            logger.info(f"No settings found for user: {user_id}")
            raise HTTPException(status_code=404, detail="User settings not found")
            
        user_data = doc.to_dict()
        logger.info(f"Successfully retrieved settings for user: {user_id}")
        
        # Remove sensitive data before returning
        response_data = {
            'canvasUrl': user_data['canvasUrl'],
            'canvas_user_id': user_data['canvas_user_id'],
            'name': user_data['name'],
            'first_name': user_data['first_name'],
            'last_name': user_data['last_name'],
            'avatar_url': user_data['avatar_url'],
            'email': user_data.get('email')  # Using get() in case email is not present
        }
        
        return response_data
        
    except Exception as e:
        logger.error(f"Error retrieving user settings: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
