from fastapi import APIRouter, Depends, Query
from src.models.course import Course
from src.services.course_service import CourseService
from src.api.middleware.auth import verify_firebase_token
from typing import List

router = APIRouter()

@router.get("/", response_model=List[Course])
async def get_user_courses(
    user_id: str = Depends(verify_firebase_token),
    force: bool = Query(False)
):
    return await CourseService.get_user_courses(user_id, force)

@router.get("/last-updated")
async def get_courses_last_updated(
    user_id: str = Depends(verify_firebase_token)
):
    return await CourseService.get_courses_last_updated(user_id)