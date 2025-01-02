from pydantic import BaseModel
from typing import Optional

class UserSettings(BaseModel):
    canvasUrl: str
    apiToken: str

class UserData(BaseModel):
    canvasUrl: str
    canvas_user_id: int
    name: str
    first_name: str
    last_name: str
    avatar_url: str
    email: Optional[str] = None

class UserSettingsUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    canvasUrl: Optional[str] = None
    apiToken: Optional[str] = None