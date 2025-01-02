from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Assignment(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    due_at: Optional[datetime] = None
    points_possible: float = 0
    submission_types: List[str] = []
    html_url: Optional[str] = None
    lock_at: Optional[datetime] = None
    course_id: int
    grade: Optional[str] = 'N/A'

class Course(BaseModel):
    id: int
    name: str
    code: str
    assignments: List[Assignment] = []
    term: Optional[int] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    time_zone: str = "UTC"