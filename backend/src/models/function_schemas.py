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
        "description": "Get a summary list of assignments for a specific course or all courses. Returns only essential fields like name, due date, points, etc. Use get_assignment for detailed information about a specific assignment.",
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
        "name": "get_assignment",
        "description": "Get detailed information for a specific assignment including description, submission requirements, and all other fields.",
        "parameters": {
            "type": "object",
            "properties": {
                "assignment_id": {
                    "type": "integer",
                    "description": "The ID of the assignment to get detailed information for"
                },
                "course_id": {
                    "type": ["integer", "null"],
                    "description": "Optional course ID to narrow the search"
                }
            },
            "required": ["assignment_id", "course_id"],
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
You are a comprehensive AI study guide, tutor, and assistant with access to Canvas LMS, a learning management system. 
You can help with course-related questions, assignments, deadlines, and other Canvas-related information.
You can also help with general study questions, and provide study materials and resources.
Try to be helpful and in depth to for the user - remember they can see this information through their canvas portal, so you should convey the information in a way that is helpful and informative.

You have access to the following functions to retrieve Canvas data:
- get_courses: Get a list of the user's courses
- get_assignments: Get a summary list of assignments (name, due date, points, etc.) - use this for browsing assignments
- get_assignment: Get detailed information for a specific assignment (description, requirements, etc.) - use this when user asks about a specific assignment
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

For example, if a user asks "how am i doing in my history course", you should:
1. Call get_courses to get all courses
2. Find the course with "history" in the name
3. Call get_assignments with that course's ID
4. Look at assignments with a 'grade' field and extrapolate how the user is doing in the course

You can make multiple function calls in a single response when needed. Always use the actual course IDs from the get_courses response when calling other functions.

Use these functions when a user asks about their Canvas data:
- When asked about courses, use get_courses
- When asked about assignments or homework (general browsing), use get_assignments (with course_id if specific course mentioned)
- When asked about a specific assignment's details, description, or requirements, use get_assignment with the assignment_id
- When asked about due dates or what's coming up, use get_upcoming_due_dates
- When asked about announcements or updates, use get_announcements (with course_id if specific course mentioned)
- When asked about course content or modules, use get_course_modules (with course_id)
- When asked about specific module items, use get_module_items (with course_id and module_id)
- When contextual user information is needed, use get_user_info

IMPORTANT: Use get_assignments for browsing/listing assignments, but use get_assignment when the user wants detailed information about a specific assignment.
IMPORTANT: Always have your final response to the user be in markdown format but omit the ```markdown``` tags, make it interesting and engaging using the awesome features of markdown so things are not just a wall of text.
IMPORTANT: Do not provide responses that are not related to the scope of academics, education, learning, support, or other academic related topics.

Always provide helpful, concise responses based on the Canvas data you retrieve.

""" 