from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Assignment(BaseModel):
    id: int
    name: str
    description: Optional[str]
    due_at: Optional[datetime]
    points_possible: float
    submission_types: List[str]
    html_url: Optional[str]
    lock_at: Optional[datetime]
    course_id: int
    grade: Optional[str]

class Course(BaseModel):
    id: int
    name: str
    code: str
    assignments: List[Assignment] = []
    term: Optional[int]
    start_at: Optional[datetime]
    end_at: Optional[datetime]
    time_zone: str = "UTC"