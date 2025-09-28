from fastapi import APIRouter, Depends, HTTPException
from src.services.course_service import CourseService
from src.services.chat_service import ChatService
from src.api.middleware.auth import verify_firebase_token
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
import json
from datetime import datetime

# Get logger
logger = logging.getLogger(__name__)

router = APIRouter()

class TodoItem(BaseModel):
    id: str
    title: str
    description: str
    priority: str  # 'high' | 'medium' | 'low'
    dueDate: Optional[str] = None
    estimatedTime: Optional[str] = None
    course: Optional[str] = None
    completed: bool = False

class DeadlineItem(BaseModel):
    id: str
    title: str
    course: str
    dueDate: str
    priority: str  # 'urgent' | 'important' | 'normal'
    points: Optional[int] = None
    description: Optional[str] = None

class StudyBlock(BaseModel):
    id: str
    title: str
    course: str
    duration: str
    topics: List[str]
    difficulty: str  # 'easy' | 'medium' | 'hard'

class InsightCard(BaseModel):
    id: str
    type: str  # 'tip' | 'warning' | 'success' | 'info'
    title: str
    message: str
    action: Optional[str] = None

class PlanSummary(BaseModel):
    totalTasks: int
    highPriorityCount: int
    upcomingDeadlines: int
    estimatedStudyTime: str

class AIPlannerResponse(BaseModel):
    todos: List[TodoItem]
    deadlines: List[DeadlineItem]
    studyBlocks: List[StudyBlock]
    insights: List[InsightCard]
    summary: PlanSummary
    generated_at: str
    course_count: int
    assignment_count: int

@router.post("/ai-planner/generate", response_model=AIPlannerResponse)
async def generate_ai_plan(
    user_id: str = Depends(verify_firebase_token)
):
    """
    Generate an AI-powered todo list and calendar based on user's course data
    """
    try:
        logger.info(f"🚀 [AI Planner API] === STARTING AI PLAN GENERATION ===")
        logger.info(f"🚀 [AI Planner API] User ID: {user_id}")
        
        # Get user's course data
        logger.info(f"🚀 [AI Planner API] Step 1: Fetching user course data...")
        courses = await CourseService.get_user_courses(user_id, force=False)
        logger.info(f"🚀 [AI Planner API] Retrieved {len(courses) if courses else 0} courses")
        
        if not courses:
            logger.warning(f"🚀 [AI Planner API] No courses found for user {user_id}")
            raise HTTPException(status_code=404, detail="No courses found for user")
        
        # Count assignments for logging
        total_assignments = sum(len(course.get('assignments', [])) for course in courses)
        logger.info(f"🚀 [AI Planner API] Course summary: {len(courses)} courses, {total_assignments} total assignments")
        
        # Format course data for AI consumption
        logger.info(f"🚀 [AI Planner API] Step 2: Formatting course data for AI...")
        formatted_data = format_course_data_for_ai(courses)
        logger.info(f"🚀 [AI Planner API] Formatted data summary:")
        logger.info(f"🚀 [AI Planner API]   - Upcoming assignments: {len(formatted_data['summary']['upcoming_assignments'])}")
        logger.info(f"🚀 [AI Planner API]   - Total assignments: {formatted_data['summary']['total_assignments']}")
        logger.info(f"🚀 [AI Planner API]   - Data size: ~{len(str(formatted_data))} chars")
        
        # Generate AI todo list using chat service
        logger.info(f"🚀 [AI Planner API] Step 3: Creating AI prompt...")
        ai_prompt = create_ai_planner_prompt(formatted_data)
        logger.info(f"🚀 [AI Planner API] Prompt created, length: {len(ai_prompt)} characters")
        
        # Use a simplified version of the chat service without saving to chat history
        logger.info(f"🚀 [AI Planner API] Step 4: Calling OpenAI API...")
        json_response = await generate_structured_plan_with_ai(ai_prompt, user_id)
        logger.info(f"🚀 [AI Planner API] OpenAI JSON response received, length: {len(json_response)} characters")
        logger.info(f"🚀 [AI Planner API] Response preview: {json_response[:200]}...")
        
        logger.info(f"🚀 [AI Planner API] Step 5: Parsing and preparing final response...")
        try:
            parsed_data = json.loads(json_response)
            logger.info(f"🚀 [AI Planner API] JSON parsed successfully with keys: {parsed_data.keys()}")
            
            response = AIPlannerResponse(
                todos=parsed_data.get("todos", []),
                deadlines=parsed_data.get("deadlines", []),
                studyBlocks=parsed_data.get("studyBlocks", []),
                insights=parsed_data.get("insights", []),
                summary=parsed_data.get("summary", {
                    "totalTasks": 0,
                    "highPriorityCount": 0,
                    "upcomingDeadlines": 0,
                    "estimatedStudyTime": "0 hours"
                }),
                generated_at=str(datetime.utcnow()),
                course_count=len(courses),
                assignment_count=total_assignments
            )
        except json.JSONDecodeError as e:
            logger.error(f"🚀 [AI Planner API] Failed to parse JSON response: {str(e)}")
            logger.error(f"🚀 [AI Planner API] Raw response: {json_response}")
            raise HTTPException(status_code=500, detail="Failed to parse AI response")
        
        logger.info(f"🚀 [AI Planner API] === AI PLAN GENERATION COMPLETED SUCCESSFULLY ===")
        logger.info(f"🚀 [AI Planner API] Final response: {response.course_count} courses, {response.assignment_count} assignments")
        
        return response
        
    except Exception as e:
        logger.error(f"🚀 [AI Planner API] === ERROR IN AI PLAN GENERATION ===")
        logger.error(f"🚀 [AI Planner API] Error type: {type(e).__name__}")
        logger.error(f"🚀 [AI Planner API] Error message: {str(e)}")
        logger.error(f"🚀 [AI Planner API] Full error details:", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to generate AI plan: {str(e)}")


def format_course_data_for_ai(courses: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Format course data into a structure optimal for AI consumption
    """
    formatted = {
        "courses": [],
        "summary": {
            "total_courses": len(courses),
            "total_assignments": 0,
            "upcoming_assignments": [],
            "recent_announcements": []
        }
    }
    
    from datetime import datetime, timedelta
    now = datetime.utcnow()
    next_30_days = now + timedelta(days=30)
    
    for course in courses:
        course_data = {
            "name": course.get('name', 'Unknown Course'),
            "code": course.get('code', ''),
            "assignments": [],
            "announcements": [],
            "modules": []
        }
        
        # Process assignments
        assignments = course.get('assignments', [])
        for assignment in assignments:
            assignment_data = {
                "name": assignment.get('name', ''),
                "due_at": assignment.get('due_at'),
                "points_possible": assignment.get('points_possible', 0),
                "description": assignment.get('description', '')[:200] if assignment.get('description') else '',
                "submitted": assignment.get('has_submitted_submissions', False),
                "graded": assignment.get('grade') is not None
            }
            
            course_data["assignments"].append(assignment_data)
            
            # Add to upcoming if due in next 30 days
            if assignment.get('due_at'):
                try:
                    due_date = datetime.fromisoformat(assignment['due_at'].replace('Z', '+00:00'))
                    if now <= due_date <= next_30_days:
                        formatted["summary"]["upcoming_assignments"].append({
                            "course": course.get('name'),
                            "assignment": assignment.get('name'),
                            "due_date": assignment.get('due_at'),
                            "points": assignment.get('points_possible', 0)
                        })
                except (ValueError, TypeError):
                    pass
        
        # Process announcements
        announcements = course.get('announcements', [])
        for announcement in announcements[:3]:  # Only recent ones
            announcement_data = {
                "title": announcement.get('title', ''),
                "posted_at": announcement.get('posted_at'),
                "message": announcement.get('message', '')[:300] if announcement.get('message') else ''
            }
            course_data["announcements"].append(announcement_data)
        
        # Process modules
        modules = course.get('modules', [])
        for module in modules[:5]:  # Limit to prevent too much data
            module_data = {
                "name": module.get('name', ''),
                "position": module.get('position', 0),
                "completed": module.get('completed_at') is not None
            }
            course_data["modules"].append(module_data)
        
        formatted["courses"].append(course_data)
        formatted["summary"]["total_assignments"] += len(assignments)
    
    return formatted


def create_ai_planner_prompt(course_data: Dict[str, Any]) -> str:
    """
    Create a focused prompt for structured JSON academic planning
    """
    upcoming_count = len(course_data["summary"]["upcoming_assignments"])
    course_count = course_data["summary"]["total_courses"]
    
    prompt = f"""
You are an expert academic planner. Based on this Canvas course data, create a structured academic plan.

COURSE DATA:
{json.dumps(course_data, indent=2, default=str)}

RETURN ONLY valid JSON matching this exact structure:

{{
  "todos": [
    {{
      "id": "unique-id-1",
      "title": "Complete Assignment Name", 
      "description": "Brief description or next steps",
      "priority": "high|medium|low",
      "dueDate": "YYYY-MM-DD" or null,
      "estimatedTime": "2 hours" or null,
      "course": "Course Code" or null,
      "completed": false
    }}
  ],
  "deadlines": [
    {{
      "id": "unique-id-2",
      "title": "Assignment Name",
      "course": "Course Code", 
      "dueDate": "YYYY-MM-DD",
      "priority": "urgent|important|normal",
      "points": 100 or null,
      "description": "Brief description"
    }}
  ],
  "studyBlocks": [
    {{
      "id": "unique-id-3",
      "title": "Study Session Name",
      "course": "Course Code",
      "duration": "90 minutes",
      "topics": ["Topic 1", "Topic 2"],
      "difficulty": "easy|medium|hard"
    }}
  ],
  "insights": [
    {{
      "id": "unique-id-4",
      "type": "tip|warning|success|info",
      "title": "Insight Title",
      "message": "Helpful message or tip",
      "action": "Suggested action" or null
    }}
  ],
  "summary": {{
    "totalTasks": 8,
    "highPriorityCount": 3,
    "upcomingDeadlines": 5,
    "estimatedStudyTime": "12 hours"
  }}
}}

REQUIREMENTS:
- Focus on actionable, specific tasks from the actual course data
- Include only assignments/tasks due in next 2 weeks for todos
- Use actual course codes and assignment names
- Prioritize by due date and point value
- Keep descriptions concise (1-2 sentences)
- Generate 5-10 todos, 3-7 deadlines, 3-5 study blocks, 2-4 insights
- All IDs must be unique
- Return ONLY the JSON, no other text
"""
    
    return prompt


async def generate_structured_plan_with_ai(prompt: str, user_id: str) -> str:
    """
    Generate todo list using OpenAI without saving to chat history
    """
    from src.services.chat_service import client, executor, partial
    import asyncio
    
    try:
        logger.info(f"🤖 [AI Generation] Starting OpenAI generation for user: {user_id}")
        logger.info(f"🤖 [AI Generation] Prompt length: {len(prompt)} characters")
        logger.info(f"🤖 [AI Generation] Prompt preview: {prompt[:300]}...")
        
        # Build conversation input for AI
        conversation_input = [{
            "role": "system",
            "content": "You are an expert academic planner. You analyze Canvas course data and return structured JSON plans with todos, deadlines, study blocks, and insights. Always return valid JSON only, no markdown or explanation text."
        }, {
            "role": "user", 
            "content": prompt
        }]
        
        logger.info(f"🤖 [AI Generation] Conversation input prepared with {len(conversation_input)} messages")
        
        # Set up API call parameters (simpler than chat - no tools needed)
        kwargs = {
            "model": "gpt-5-mini",
            "store": False,  # Don't store this conversation
            "reasoning": {"effort": "medium"},
            "input": conversation_input
        }
        
        logger.info(f"🤖 [AI Generation] API parameters set: model={kwargs['model']}, store={kwargs['store']}")
        logger.info(f"🤖 [AI Generation] Making OpenAI API call...")
        
        # Make the API call
        loop = asyncio.get_event_loop()
        start_time = asyncio.get_event_loop().time()
        
        response = await loop.run_in_executor(
            executor,
            partial(client.responses.create, **kwargs)
        )
        
        end_time = asyncio.get_event_loop().time()
        logger.info(f"🤖 [AI Generation] OpenAI API call completed in {end_time - start_time:.2f} seconds")
        logger.info(f"🤖 [AI Generation] Response ID: {getattr(response, 'id', 'No ID')}")
        logger.info(f"🤖 [AI Generation] Response has output_text: {hasattr(response, 'output_text') and response.output_text is not None}")
        
        # Extract the response content
        if response.output_text:
            logger.info(f"🤖 [AI Generation] Response text length: {len(response.output_text)} characters")
            logger.info(f"🤖 [AI Generation] Response preview: {response.output_text[:200]}...")
            return response.output_text
        else:
            # Fallback if no output_text
            logger.warning(f"🤖 [AI Generation] No output_text in response, using fallback")
            logger.info(f"🤖 [AI Generation] Response attributes: {dir(response)}")
            return "I apologize, but I'm having trouble generating your personalized plan right now. Please try again in a moment."
            
    except Exception as e:
        logger.error(f"🤖 [AI Generation] === ERROR IN AI GENERATION ===")
        logger.error(f"🤖 [AI Generation] Error type: {type(e).__name__}")
        logger.error(f"🤖 [AI Generation] Error message: {str(e)}")
        logger.error(f"🤖 [AI Generation] Full error details:", exc_info=True)
        return f"I encountered an error while creating your plan: {str(e)}. Please try again."
