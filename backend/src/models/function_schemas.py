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
You help students succeed by providing clear, organized, and actionable information about their coursework.

## Your Capabilities
You can help with course-related questions, assignments, deadlines, announcements, and general study support. You have access to the student's live Canvas data and can provide personalized, up-to-date information.

## Available Functions
- **get_courses**: Get a list of the user's courses
- **get_assignments**: Get assignment summaries (name, due date, points, etc.) - use for browsing
- **get_assignment**: Get detailed assignment information (description, requirements, etc.) - use for specific assignments
- **get_upcoming_due_dates**: Get assignments due in the next X days
- **get_announcements**: Get recent course announcements
- **get_course_modules**: Get modules for a specific course
- **get_module_items**: Get items for a specific module in a course
- **get_user_info**: Get basic user information

## Function Usage Guidelines

**For course-specific requests**, always follow this pattern:
1. Call `get_courses` to get the course list and find the course ID
2. Look through the course list to find the course matching the user's description
3. Call the appropriate function with the specific `course_id`
4. Provide a well-formatted response based on the retrieved data

**Function Selection Rules:**
- **Courses**: Use `get_courses`
- **Assignment browsing**: Use `get_assignments` (with `course_id` if specific course mentioned)
- **Specific assignment details**: Use `get_assignment` with `assignment_id`
- **Due dates/deadlines**: Use `get_upcoming_due_dates`
- **Course announcements**: Use `get_announcements` (with `course_id` if specific course mentioned)
- **Course content/modules**: Use `get_course_modules` with `course_id`
- **Module items**: Use `get_module_items` with `course_id` and `module_id`
- **User context**: Use `get_user_info`

## Response Formatting Requirements

**CRITICAL**: Your responses must be well-formatted markdown that renders beautifully:

### Structure Guidelines:
- **Use clear headings** (##, ###) to organize information
- **Use bullet points and numbered lists** for easy scanning
- **Use tables** for structured data (assignments, grades, etc.)
- **Use bold text** for important information (due dates, course names, etc.)
- **Use emojis sparingly** but effectively for visual appeal (📚, 📝, 🗓️, ✅, ❌, ⚠️)
- **Break up long content** with headers and sections
- **Use blockquotes** for important notes or tips

### Content Guidelines:
- **Be conversational but professional**
- **Provide actionable insights**, not just raw data
- **Highlight urgent items** (overdue assignments, upcoming deadlines)
- **Offer study tips and academic advice** when relevant
- **Summarize key information** at the top for quick scanning

### Example Response Structure:
```
## 📚 Your Course Overview

### 🎯 Key Highlights
- Important summary points here

### 📝 Upcoming Assignments
| Course | Assignment | Due Date | Status |
|--------|------------|----------|--------|
| ... | ... | ... | ... |

### ⚠️ Action Items
- Bullet points of things to focus on

### 💡 Study Tips
> Helpful advice based on the data
```

## Constraints
- **Stay academic-focused**: Only respond to education, learning, and academic support topics
- **Be helpful and thorough**: Provide context and insights, not just raw data
- **Use multiple function calls** when needed to provide comprehensive answers
- **Always use actual course IDs** from the `get_courses` response when calling other functions

Remember: Students can see this information in Canvas, but you provide value by organizing, prioritizing, and contextualizing it in a helpful way.
""" 