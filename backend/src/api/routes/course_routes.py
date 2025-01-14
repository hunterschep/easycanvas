from fastapi import APIRouter, Depends, Query, Body, HTTPException
from src.models.course import Course, CourseBase
from src.services.course_service import CourseService
from src.api.middleware.auth import verify_firebase_token
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/", response_model=List[Course])
async def get_user_courses(
    user_id: str = Depends(verify_firebase_token),
    force: bool = Query(False)
):
    return await CourseService.get_user_courses(user_id, force)

@router.get("/available", response_model=List[CourseBase])
async def get_available_courses(
    user_id: str = Depends(verify_firebase_token)
):
    """Get all available courses for selection"""
    return await CourseService.get_available_courses(user_id)

@router.post("/select")
async def save_selected_courses(
    course_ids: List[int] = Body(...),
    user_id: str = Depends(verify_firebase_token)
):
    """Save the user's selected courses"""
    return await CourseService.save_selected_courses(user_id, course_ids)

@router.get("/selected")
async def get_selected_courses(
    user_id: str = Depends(verify_firebase_token)
):
    """Get the user's currently selected courses"""
    return {"selected_course_ids": await CourseService.get_selected_courses(user_id)}

@router.get("/last-updated")
async def get_courses_last_updated(
    user_id: str = Depends(verify_firebase_token)
):
    return await CourseService.get_courses_last_updated(user_id)

@router.get("/{course_id}/modules/{module_id}/items")
async def get_module_items(
    course_id: int,
    module_id: int,
    user_id: str = Depends(verify_firebase_token)
) -> List[Dict[str, Any]]:
    """Get items for a specific module in a course."""
    try:
        # Get user data and canvas instance
        user_data = await CourseService._get_user_data(user_id)
        canvas = await CourseService._get_canvas_instance(user_data)
        
        # Get module items
        items = await CourseService.get_module_items(canvas, course_id, module_id)
        return items
    except Exception as e:
        logger.error(f"Error fetching module items: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch module items: {str(e)}"
        )