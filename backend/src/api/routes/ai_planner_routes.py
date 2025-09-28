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

class AIPlannerResponse(BaseModel):
    todo_list: str
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
        todo_response = await generate_todo_list_with_ai(ai_prompt, user_id)
        logger.info(f"🚀 [AI Planner API] OpenAI response received, length: {len(todo_response)} characters")
        logger.info(f"🚀 [AI Planner API] Response preview: {todo_response[:200]}...")
        
        logger.info(f"🚀 [AI Planner API] Step 5: Preparing final response...")
        response = AIPlannerResponse(
            todo_list=todo_response,
            generated_at=str(datetime.utcnow()),
            course_count=len(courses),
            assignment_count=total_assignments
        )
        
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
    Create a comprehensive prompt for AI todo list generation
    """
    upcoming_count = len(course_data["summary"]["upcoming_assignments"])
    course_count = course_data["summary"]["total_courses"]
    
    prompt = f"""
You are an expert academic planner and study strategist. Based on the following Canvas course data, create a comprehensive, personalized todo list and study plan.

COURSE DATA SUMMARY:
- Total Courses: {course_count}
- Total Assignments: {course_data["summary"]["total_assignments"]}
- Upcoming Assignments (next 30 days): {upcoming_count}

DETAILED COURSE INFORMATION:
{json.dumps(course_data, indent=2, default=str)}

INSTRUCTIONS:
Create a detailed, actionable todo list and study plan that includes:

1. **IMMEDIATE PRIORITIES** (This Week)
   - List urgent assignments due soon
   - Include specific deadlines and point values
   - Prioritize by due date and importance

2. **STUDY SCHEDULE RECOMMENDATIONS**
   - Suggest optimal study times for each subject
   - Recommend time blocks for different types of work
   - Include review sessions for completed material

3. **LONG-TERM PLANNING** (Next 2-4 Weeks)
   - Break down larger assignments into manageable tasks
   - Suggest preparation timelines for upcoming work
   - Identify potential conflicts and suggest solutions

4. **ORGANIZATION TIPS**
   - Course-specific recommendations
   - Resource management suggestions
   - Productivity strategies based on workload

5. **WELLNESS & BALANCE**
   - Suggest break times and stress management
   - Recommend balance between courses
   - Include buffer time for unexpected issues

FORMAT your response as a clean, well-structured markdown document with clear headings, bullet points, and actionable items. Make it specific to the actual courses and assignments provided.

Be encouraging, practical, and specific. Include actual assignment names, due dates, and course names from the data provided.
"""
    
    return prompt


async def generate_todo_list_with_ai(prompt: str, user_id: str) -> str:
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
            "content": "You are an expert academic planner and study strategist. You help students create comprehensive, actionable todo lists and study plans based on their Canvas course data."
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
