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

class CourseBase(BaseModel):
    """Basic course information for selection"""
    id: int
    name: str
    code: str
    term: Optional[int] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None

class Course(BaseModel):
    id: int
    name: str
    code: str
    assignments: List[Assignment] = []
    term: Optional[int] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    time_zone: str = "UTC"
    homepage: Optional[str] = None  # Will be populated separately from front_page endpoint

def course_to_dict(course: Course) -> dict:
    return {
        "id": course.id,
        "name": course.name,
        "code": course.code,
        "assignments": [assignment.dict() for assignment in course.assignments],
        "term": course.term,
        "start_at": course.start_at,
        "end_at": course.end_at,
        "time_zone": course.time_zone,
        "homepage": course.homepage
    }