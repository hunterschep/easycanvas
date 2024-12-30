from fastapi import FastAPI, HTTPException, Depends, Header  # Add Header here
from fastapi.middleware.cors import CORSMiddleware
from firebase_admin_config import auth
from pydantic import BaseModel
from typing import Optional
from firebase_admin_config import db
from canvasapi import Canvas
from google.cloud import firestore  # Add this for SERVER_TIMESTAMP
import logging
from utils.encryption import encrypt_token, decrypt_token
import os
import asyncio
from datetime import datetime

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
    allow_origins=os.getenv('CORS_ORIGINS').split(','),  # Now reads from env
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

# Model to update user settings
class UserSettingsUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    name: Optional[str] = None
    
# Verify that Firebase access is allowed 
async def verify_firebase_token(authorization: str = Header(...)):
    try:
        if not authorization.startswith('Bearer '):
            logger.error("Authorization header missing Bearer prefix")
            raise HTTPException(status_code=401, detail="Invalid authorization format")
            
        token = authorization.split("Bearer ")[1]
        logger.info("Attempting to verify Firebase token")
        
        try:
            decoded_token = auth.verify_id_token(token)
            logger.info(f"Successfully verified token for user: {decoded_token['uid']}")
            return decoded_token['uid']
        except Exception as e:
            logger.error(f"Firebase token verification failed: {str(e)}")
            raise HTTPException(status_code=401, detail="Invalid token")
            
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid authentication")

# Validate CanvasAPI token and set initial user settings 
@app.post("/api/user/settings", response_model=UserData)
async def save_user_settings(
    settings: UserSettings,
    user_id: str = Depends(verify_firebase_token)
):
    try:
        # Encrypt the Canvas API token before storing
        encrypted_token = encrypt_token(settings.apiToken)
        
        # Validate Canvas API token and get user info
        canvas = Canvas(settings.canvasUrl, settings.apiToken)
        canvas_user = canvas.get_current_user()

        # Extract user details from Canvas response
        user_data = {
            'canvasUrl': settings.canvasUrl,
            'apiToken': encrypted_token,  # Store encrypted token
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
            # Return a specific response for new users
            raise HTTPException(
                status_code=404,
                detail="NEW_USER"
            )
            
        user_data = doc.to_dict()
        logger.info(f"Successfully retrieved settings for user: {user_id}")
        
        response_data = {
            'canvasUrl': user_data['canvasUrl'],
            'canvas_user_id': user_data['canvas_user_id'],
            'name': user_data['name'],
            'first_name': user_data['first_name'],
            'last_name': user_data['last_name'],
            'avatar_url': user_data['avatar_url'],
            'email': user_data.get('email')
        }
        
        return response_data
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving user settings: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.patch("/api/user/settings", response_model=UserData)
async def update_user_settings(
    updates: UserSettingsUpdate,
    user_id: str = Depends(verify_firebase_token)
):
    try:
        doc_ref = db.collection('users').document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
            
        # Update the document with the new fields
        update_data = updates.dict(exclude_unset=True)
        update_data['updatedAt'] = firestore.SERVER_TIMESTAMP
        doc_ref.update(update_data)
        
        # Get and return the updated document
        updated_doc = doc_ref.get()
        user_data = updated_doc.to_dict()
        
        return {
            'canvasUrl': user_data['canvasUrl'],
            'canvas_user_id': user_data['canvas_user_id'],
            'name': user_data['name'],
            'first_name': user_data['first_name'],
            'last_name': user_data['last_name'],
            'avatar_url': user_data['avatar_url'],
            'email': user_data.get('email')
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.delete("/api/user/settings")
async def delete_user_settings(
    user_id: str = Depends(verify_firebase_token)
):

    try:
        # Delete user document from Firestore
        doc_ref = db.collection('users').document(user_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            raise HTTPException(status_code=404, detail="User not found")
            
        # Delete the document from Firestore
        doc_ref.delete()
        
        # Delete the user from Firebase Auth
        try:
            auth.delete_user(user_id)
        except Exception as e:
            logger.error(f"Error deleting Firebase Auth user: {str(e)}")
            # Even if Auth deletion fails, we've already deleted from Firestore
            
        return {"message": "Account successfully deleted"}
        
    except Exception as e:
        logger.error(f"Error deleting user account: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/user/courses")
async def get_user_courses(
    user_id: str = Depends(verify_firebase_token),
    force: bool = False
):
    try:
        logger.info(f"[API Call] GET /api/user/courses for user: {user_id}")
        
        # Check Firestore first
        doc_ref = db.collection('userCourses').document(user_id)
        doc = doc_ref.get()
        
        if not force and doc.exists:
            logger.info("[Cache Hit] Found courses in Firestore cache")
            courses_data = doc.to_dict()
            last_updated = courses_data.get('lastUpdated', None)
            if last_updated:
                # Convert timestamp to datetime and check if it's less than 6 hours old
                last_updated_dt = last_updated.timestamp()
                hours_diff = (datetime.now() - datetime.fromtimestamp(last_updated_dt)).total_seconds() / 3600
                if hours_diff < 6:
                    return courses_data['courses']
            logger.info("[Cache Miss] Cached data is stale, fetching fresh data")

        # Get user's Canvas token and URL
        logger.info("[API Call] Fetching user settings from Firestore")
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            logger.error("[Error] User settings not found in Firestore")
            raise HTTPException(status_code=404, detail="User settings not found")
        
        user_data = user_doc.to_dict()
        canvas_url = user_data['canvasUrl']
        decrypted_token = decrypt_token(user_data['apiToken'])
        
        logger.info(f"[API Call] Initializing Canvas API connection to: {canvas_url}")
        canvas = Canvas(canvas_url, decrypted_token)
        
        # Fetch courses with pagination
        courses = []
        try:
            logger.info("[API Call] Fetching courses from Canvas API")
            all_courses = canvas.get_courses()
            logger.info(f"[Response] Received courses from Canvas API")
            
            CURRENT_TERM_ID = 7109
            
            for course in all_courses:
                logger.info(f"[Course Object] Processing course: {course.__dict__}")
                
                # Check workflow_state, enrollment status, and term
                is_available = getattr(course, 'workflow_state', None) == 'available'
                is_current_term = getattr(course, 'enrollment_term_id', None) == CURRENT_TERM_ID
                has_active_enrollment = False
                
                enrollments = getattr(course, 'enrollments', [])
                for enrollment in enrollments:
                    if (enrollment.get('enrollment_state') == 'active' and 
                        enrollment.get('type') in ['student', 'teacher', 'ta']):
                        has_active_enrollment = True
                        break
                
                if is_available and has_active_enrollment and is_current_term:
                    course_data = {
                        'id': course.id,
                        'name': course.name,
                        'code': course.course_code,
                        'assignments': [],
                        'term': getattr(course, 'enrollment_term_id', None),
                        'start_at': getattr(course, 'start_at', None),
                        'end_at': getattr(course, 'end_at', None),
                        'time_zone': getattr(course, 'time_zone', 'UTC')
                    }
                    logger.info(f"[Course Added] Added course to response: {course_data['name']}")
                    
                    # Fetch assignments for each course
                    try:
                        for assignment in course.get_assignments():
                            if getattr(assignment, 'published', True):
                                assignment_data = {
                                    'id': assignment.id,
                                    'name': assignment.name,
                                    'description': getattr(assignment, 'description', None),
                                    'due_at': getattr(assignment, 'due_at', None),
                                    'points_possible': getattr(assignment, 'points_possible', 0),
                                    'submission_types': getattr(assignment, 'submission_types', []),
                                    'html_url': getattr(assignment, 'html_url', None),
                                    'lock_at': getattr(assignment, 'lock_at', None),
                                    'course_id': course.id
                                }
                                course_data['assignments'].append(assignment_data)
                    except Exception as e:
                        logger.error(f"[Error] Failed to fetch assignments for course {course.id}: {str(e)}")
                    
                    courses.append(course_data)
                    await asyncio.sleep(0.2)
                else:
                    logger.info(f"[Course Skipped] Course not included: {getattr(course, 'name', 'Unknown')}")

        except Exception as e:
            logger.error(f"[Error] Failed to fetch courses from Canvas: {str(e)}")
            raise HTTPException(status_code=500, detail="Error fetching courses from Canvas")

        logger.info(f"[Success] Found {len(courses)} active courses")
        
        # Save to Firestore
        doc_ref.set({
            'courses': courses,
            'lastUpdated': firestore.SERVER_TIMESTAMP
        })
        logger.info("[Cache Update] Saved courses to Firestore cache")

        return courses

    except Exception as e:
        logger.error(f"[Error] Unhandled exception in get_user_courses: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

