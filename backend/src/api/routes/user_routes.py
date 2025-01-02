from fastapi import APIRouter, Depends, HTTPException
from src.models.user import UserSettings, UserData, UserSettingsUpdate
from src.services.user_service import UserService
from src.api.middleware.auth import verify_firebase_token

router = APIRouter()

@router.post("/settings", response_model=UserData)
async def save_user_settings(
    settings: UserSettings,
    user_id: str = Depends(verify_firebase_token)
):
    return await UserService.save_user_settings(user_id, settings)

@router.get("/settings", response_model=UserData)
async def get_user_settings(
    user_id: str = Depends(verify_firebase_token)
):
    return await UserService.get_user_settings(user_id)

@router.patch("/settings", response_model=UserData)
async def update_user_settings(
    settings: UserSettingsUpdate,
    user_id: str = Depends(verify_firebase_token)
):
    return await UserService.update_user_settings(user_id, settings)

@router.delete("/settings")
async def delete_user_settings(
    user_id: str = Depends(verify_firebase_token)
):
    return await UserService.delete_user_settings(user_id)