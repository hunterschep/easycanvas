from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class Author(BaseModel):
    id: Optional[int] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None

class Announcement(BaseModel):
    id: int
    title: str
    message: str
    posted_at: Optional[datetime] = None
    delayed_post_at: Optional[datetime] = None
    author: Optional[Author] = None
    read_state: Optional[str] = None
    unread_count: int = 0
    discussion_subentry_count: int = 0
    html_url: Optional[str] = None

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

class CourseBase(BaseModel):
    """Basic course information for selection"""
    id: int
    name: str
    code: str
    term: Optional[int] = None
    start_at: Optional[datetime] = None
    end_at: Optional[datetime] = None

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
        "homepage": course.homepage
    }