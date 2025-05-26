from typing import List, Dict, Any

# Define the tools that OpenAI can use
CANVAS_TOOLS = [
    {
        "type": "function",
        "name": "get_courses",
        "description": "Get a list of the user's Canvas courses",
        "parameters": {
            "type": "object",
            "properties": {},
            "required": [],
            "additionalProperties": False
        },
        "strict": True
    },
    {
        "type": "function",
        "name": "get_assignments",
        "description": "Get assignments for a specific course or all courses",
        "parameters": {
            "type": "object",
            "properties": {
                "course_id": {
                    "type": ["integer", "null"],
                    "description": "The ID of the course to get assignments from. If not provided, returns assignments from all courses."
                },
                "days_due": {
                    "type": ["integer", "null"],
                    "description": "Filter assignments to only those due within this many days."
                }
            },
            "required": ["course_id", "days_due"],
            "additionalProperties": False
        },
        "strict": True
    },
    {
        "type": "function",
        "name": "get_upcoming_due_dates",
        "description": "Get assignments due in the next specified number of days",
        "parameters": {
            "type": "object",
            "properties": {
                "days": {
                    "type": "integer",
                    "description": "Number of days to look ahead for assignments due",
                    "default": 7
                }
            },
            "required": ["days"],
            "additionalProperties": False
        },
        "strict": True
    },
    {
        "type": "function",
        "name": "get_announcements",
        "description": "Get recent announcements from courses",
        "parameters": {
            "type": "object",
            "properties": {
                "course_id": {
                    "type": ["integer", "null"],
                    "description": "The ID of the course to get announcements from. If not provided, returns announcements from all courses."
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum number of announcements to return",
                    "default": 10
                }
            },
            "required": ["course_id", "limit"],
            "additionalProperties": False
        },
        "strict": True
    },
    {
        "type": "function",
        "name": "get_course_modules",
        "description": "Get modules for a specific course",
        "parameters": {
            "type": "object",
            "properties": {
                "course_id": {
                    "type": "integer",
                    "description": "The ID of the course to get modules from"
                }
            },
            "required": ["course_id"],
            "additionalProperties": False
        },
        "strict": True
    },
    {
        "type": "function",
        "name": "get_module_items",
        "description": "Get items for a specific module in a course",
        "parameters": {
            "type": "object",
            "properties": {
                "course_id": {
                    "type": "integer",
                    "description": "The ID of the course"
                },
                "module_id": {
                    "type": "integer",
                    "description": "The ID of the module"
                }
            },
            "required": ["course_id", "module_id"],
            "additionalProperties": False
        },
        "strict": True
    },
    {
        "type": "function",
        "name": "get_user_info",
        "description": "Get basic information about the user",
        "parameters": {
            "type": "object",
            "properties": {},
            "required": [],
            "additionalProperties": False
        },
        "strict": True
    }
]

# System message to instruct the model on when to use functions
SYSTEM_MESSAGE_WITH_TOOLS = """
You are an AI assistant for Canvas, a learning management system. You can help with course-related questions, assignments, deadlines, and other Canvas-related information.

You have access to the following functions to retrieve Canvas data:
- get_courses: Get a list of the user's courses
- get_assignments: Get assignments for a specific course or all courses
- get_upcoming_due_dates: Get assignments due in the next X days
- get_announcements: Get recent announcements from courses
- get_course_modules: Get modules for a specific course
- get_module_items: Get items for a specific module in a course
- get_user_info: Get basic information about the user

IMPORTANT: When a user asks about modules, assignments, or other content for a specific course (like "NLP class", "Natural Language Processing", "history course", etc.), you MUST:

1. First call get_courses to get the list of courses and find the course ID
2. Look through the course list to find the course that matches the user's description
3. Then call the appropriate function (get_course_modules, get_assignments, etc.) with the specific course_id
4. Provide a comprehensive response based on the retrieved data

For example, if a user asks "show me modules in my NLP class":
1. Call get_courses to get all courses
2. Find the course with "NLP" or "Natural Language" in the name
3. Call get_course_modules with that course's ID
4. Present the modules in a clear format

You can make multiple function calls in a single response when needed. Always use the actual course IDs from the get_courses response when calling other functions.

Use these functions when a user asks about their Canvas data:
- When asked about courses, use get_courses
- When asked about assignments or homework, use get_assignments (with course_id if specific course mentioned)
- When asked about due dates or what's coming up, use get_upcoming_due_dates
- When asked about announcements or updates, use get_announcements (with course_id if specific course mentioned)
- When asked about course content or modules, use get_course_modules (with course_id)
- When asked about specific module items, use get_module_items (with course_id and module_id)
- When contextual user information is needed, use get_user_info

Always provide helpful, concise responses based on the Canvas data you retrieve.
""" 