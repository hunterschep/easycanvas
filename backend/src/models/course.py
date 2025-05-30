from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class Assignment(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    due_at: Optional[datetime] = None
    points_possible: Optional[float] = None
    submission_types: Optional[List[str]] = None
    html_url: str
    lock_at: Optional[datetime] = None
    course_id: int
    grade: Optional[str] = None
    score: Optional[float] = None
    has_submitted_submissions: bool = False

class Announcement(BaseModel):
    id: int
    title: str
    message: str
    posted_at: datetime
    url: Optional[str] = None

class CourseBase(BaseModel):
    """Basic course information for selection"""
    id: int
    name: str
    code: str
    term: Optional[int] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None

class ModuleItem(BaseModel):
    id: int
    title: str
    position: int
    indent: int = 0
    type: Optional[str] = None
    module_id: int
    html_url: Optional[str] = None
    content_id: Optional[int] = None
    url: Optional[str] = None
    completion_requirement: Optional[Dict[str, Any]] = None

class Module(BaseModel):
    id: int
    name: str
    position: int
    unlock_at: Optional[datetime] = None
    workflow_state: str = "active"
    state: Optional[str] = None
    completed_at: Optional[datetime] = None
    require_sequential_progress: bool = False
    published: bool = True
    items_count: int = 0
    items_url: Optional[str] = None
    prerequisite_module_ids: List[int] = []
    items: List[ModuleItem] = []

class Course(BaseModel):
    id: int
    name: str
    code: str
    assignments: List[Assignment] = []
    modules: List[Module] = []
    announcements: List[Announcement] = []
    term: Optional[int] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None
    time_zone: str = "UTC"
    homepage: Optional[str] = None  # Will be populated separately from front_page endpoint
    colorId: Optional[int] = None  # For consistent course coloring
    
def course_to_dict(course: Course) -> dict:
    return {
        "id": course.id,
        "name": course.name,
        "code": course.code,
        "assignments": [assignment.dict() for assignment in course.assignments],
        "modules": [module.dict() for module in course.modules],
        "announcements": [announcement.dict() for announcement in course.announcements],
        "term": course.term,
        "start_at": course.start_at,
        "end_at": course.end_at,
        "time_zone": course.time_zone,
        "homepage": course.homepage,
        "colorId": course.colorId
    }