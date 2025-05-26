from openai import OpenAI
from datetime import datetime
import asyncio
import json
from functools import partial
from concurrent.futures import ThreadPoolExecutor
from src.models.chat import ChatMessage, MessageRole
from src.services.firestore_service import FirestoreService
from src.config.settings import get_settings
from typing import Optional, List, Dict, Tuple, Any
from src.models.function_schemas import CANVAS_TOOLS, SYSTEM_MESSAGE_WITH_TOOLS
from src.services.canvas_tools import CanvasTools
import logging

# Setup logging
logger = logging.getLogger(__name__)

settings = get_settings()
client = OpenAI(api_key=settings.OPENAI_API_KEY)
executor = ThreadPoolExecutor()

# Token counting constants
MAX_CONTEXT_TOKENS = 8000  # 8k token limit for conversation history
RESPONSE_TOKEN_BUFFER = int(MAX_CONTEXT_TOKENS * 0.25)  # Reserve 25% for response
AVAILABLE_INPUT_TOKENS = MAX_CONTEXT_TOKENS - RESPONSE_TOKEN_BUFFER

def estimate_token_count(text: str) -> int:
    """
    Estimate the number of tokens in a string.
    This is a rough approximation - about 4 characters per token for English text.
    """
    return max(1, len(text) // 4)

def truncate_conversation_by_tokens(messages: list, max_tokens: int) -> list:
    """
    Truncate conversation messages to fit within token limit.
    Always keeps the system message (first message) and truncates from the beginning.
    """
    if not messages:
        return messages
    
    logger.info(f"Truncating conversation: input has {len(messages)} messages, max_tokens={max_tokens}")
    
    # Always keep the system message
    system_message = messages[0]
    other_messages = messages[1:]
    
    # Calculate tokens for system message
    system_tokens = estimate_token_count(system_message.get('content', ''))
    available_tokens = max_tokens - system_tokens
    
    logger.info(f"System message uses {system_tokens} tokens, {available_tokens} tokens available for other messages")
    
    # Work backwards from the most recent messages
    selected_messages = []
    current_tokens = 0
    
    for i, message in enumerate(reversed(other_messages)):
        message_tokens = estimate_token_count(message.get('content', ''))
        logger.info(f"Message {len(other_messages) - i - 1}: {message_tokens} tokens, role={message.get('role', 'unknown')}")
        
        if current_tokens + message_tokens <= available_tokens:
            selected_messages.insert(0, message)
            current_tokens += message_tokens
            logger.info(f"  -> Included (total: {current_tokens} tokens)")
        else:
            logger.info(f"  -> Excluded (would exceed limit: {current_tokens + message_tokens} > {available_tokens})")
            break
    
    result = [system_message] + selected_messages
    logger.info(f"Truncated conversation from {len(messages)} to {len(result)} messages ({current_tokens + system_tokens} estimated tokens)")
    return result

class ChatService:
    @staticmethod
    async def generate_response(
        message_content: str, 
        user_id: str,
        chat_id: Optional[str] = None, 
        previous_response_id: Optional[str] = None,
        previous_messages: Optional[List[ChatMessage]] = None
    ) -> Tuple[ChatMessage, str, str]:
        """
        Generate a response using OpenAI API and save to Firestore
        
        Args:
            message_content: The user's message content
            user_id: The user's ID
            chat_id: Optional chat ID for existing chats
            previous_response_id: Optional ID of the previous response to maintain conversation context
            previous_messages: Optional list of previous messages for context
            
        Returns:
            A tuple containing (ChatMessage response, response_id, chat_id)
        """
        try:
            # Create user message object
            user_message = ChatMessage(
                role=MessageRole.USER,
                content=message_content,
                timestamp=datetime.utcnow()
            )
            
            # Create or get chat
            if not chat_id:
                # Create a new chat with first few words as the title
                title = message_content[:30] + "..." if len(message_content) > 30 else message_content
                chat_id = await FirestoreService.create_chat(user_id, title)
            
            # Save user message to Firestore
            user_message_id = await FirestoreService.save_message(chat_id, user_message)
            user_message.message_id = user_message_id
            
            # Run the synchronous OpenAI API call in a separate thread to avoid blocking
            loop = asyncio.get_event_loop()
            
            # Build the conversation input array
            # Always start with the system message
            conversation_input = [{
                "role": "system",
                "content": SYSTEM_MESSAGE_WITH_TOOLS
            }]
            
            # If there are previous messages, add them to build the full conversation
            if previous_messages and len(previous_messages) > 0:
                logger.info(f"Adding {len(previous_messages)} previous messages to conversation")
                
                added_count = 0
                for i, msg in enumerate(previous_messages):
                    # Log each message for debugging
                    msg_type = getattr(msg, 'type', None)
                    logger.info(f"Processing previous message {i}: role={msg.role}, type={msg_type}, content_length={len(msg.content)}")
                    
                    # Handle regular text messages (skip function call messages)
                    if not hasattr(msg, 'type') or msg.type is None or msg.type == "text":
                        conversation_input.append({
                            "role": msg.role,
                            "content": msg.content
                        })
                        added_count += 1
                        logger.info(f"Added message {i} to conversation")
                    else:
                        logger.info(f"Skipped message {i} with type {msg_type}")
                
                logger.info(f"Successfully added {added_count} out of {len(previous_messages)} previous messages to conversation")
            
            # If no previous messages but we have a chat_id, try to load recent messages from the database
            elif chat_id:
                logger.info(f"No previous messages provided, attempting to load recent messages from chat {chat_id}")
                try:
                    # Load recent messages from the database
                    recent_messages = await FirestoreService.get_chat_messages(chat_id)
                    
                    # Sort by timestamp and take the most recent ones
                    if recent_messages:
                        sorted_messages = sorted(recent_messages, key=lambda x: x.get('timestamp', datetime.min))
                        
                        # Add recent messages to conversation (limit to avoid token overflow)
                        for msg_data in sorted_messages[-40:]:  # Take last 40 messages
                            if msg_data.get('role') in ['user', 'assistant']:
                                conversation_input.append({
                                    "role": msg_data['role'],
                                    "content": msg_data['content']
                                })
                        
                        logger.info(f"Added {len(sorted_messages[-40:])} recent messages from database")
                except Exception as e:
                    logger.warning(f"Could not load recent messages from database: {e}")
            
            # Add the current user message
            conversation_input.append({
                "role": "user",
                "content": message_content
            })
            
            # Log conversation before truncation
            logger.info(f"Conversation before truncation has {len(conversation_input)} messages:")
            for i, msg in enumerate(conversation_input):
                role = msg.get('role', 'unknown')
                content_length = len(msg.get('content', ''))
                logger.info(f"  Message {i}: role={role}, content_length={content_length}")
            
            # Truncate conversation based on token limits
            logger.info(f"About to truncate conversation with {len(conversation_input)} messages using {AVAILABLE_INPUT_TOKENS} available tokens")
            conversation_input = truncate_conversation_by_tokens(conversation_input, AVAILABLE_INPUT_TOKENS)
            
            logger.info(f"Built final conversation with {len(conversation_input)} messages")
            
            # Set up the API call parameters
            kwargs = {
                "model": "o4-mini-2025-04-16",
                "store": True,
                "tools": CANVAS_TOOLS,
                "reasoning": {"effort": "medium"},
                "input": conversation_input
            }
            
            # First call to get potential function calls
            logger.info("Making initial API call to OpenAI")
            try:
                response = await loop.run_in_executor(
                    executor,
                    partial(client.responses.create, **kwargs)
                )
                
                # Log the response structure
                logger.info(f"OpenAI response received, response ID: {response.id}")
                logger.info(f"Response has output: {response.output is not None}")
                if response.output:
                    logger.info(f"Response output types: {[item.type for item in response.output]}")
                
                # Check if the model wants to call functions
                if response.output and any(item.type == "function_call" for item in response.output):
                    logger.info("Function calls detected in response")
                    
                    # Handle multiple rounds of function calls
                    current_response = response
                    input_messages = kwargs["input"].copy()
                    max_rounds = 3  # Prevent infinite loops
                    round_count = 0
                    
                    while (current_response.output and 
                           any(item.type == "function_call" for item in current_response.output) and 
                           round_count < max_rounds):
                        
                        round_count += 1
                        logger.info(f"Processing function call round {round_count}")
                        
                        # Add all items from the current response output
                        for item in current_response.output:
                            logger.info(f"Adding output item of type {item.type} to messages")
                            input_messages.append(item)
                        
                        # Process function calls and add results
                        for item in current_response.output:
                            if item.type != "function_call":
                                continue
                            
                            logger.info(f"Processing function call: {item.name}")
                            # Parse arguments
                            name = item.name
                            arguments = json.loads(item.arguments)
                            logger.info(f"Function arguments: {arguments}")
                            
                            # Execute the function
                            logger.info(f"Executing function {name} with user_id {user_id}")
                            result = await ChatService._execute_function(name, arguments, user_id)
                            logger.info(f"Function execution complete. Result length: {len(result)}")
                            
                            # Add the function result to the messages
                            logger.info(f"Adding function result for call_id: {item.call_id}")
                            input_messages.append({
                                "type": "function_call_output",
                                "call_id": item.call_id,
                                "output": result
                            })
                        
                        # Make another call with the function results
                        logger.info(f"Making API call round {round_count + 1} with function results")
                        kwargs["input"] = input_messages
                        
                        # Log the input messages for debugging
                        logger.info(f"Round {round_count + 1} call input message count: {len(input_messages)}")
                        
                        try:
                            current_response = await loop.run_in_executor(
                                executor,
                                partial(client.responses.create, **kwargs)
                            )
                            
                            logger.info(f"Round {round_count + 1} response received, ID: {current_response.id}")
                            if current_response.output:
                                logger.info(f"Round {round_count + 1} response output types: {[item.type for item in current_response.output]}")
                            else:
                                logger.warning(f"Round {round_count + 1} response has no output")
                                break
                                
                        except Exception as func_error:
                            logger.error(f"Error in round {round_count + 1} API call: {str(func_error)}", exc_info=True)
                            break
                    
                    # Get the final response text
                    assistant_message = current_response.output_text
                    logger.info(f"Final response message length: {len(assistant_message) if assistant_message else 0}")
                    
                    # Check if we got an empty response and provide a fallback
                    if not assistant_message:
                        logger.warning("Received empty message from OpenAI, using fallback response")
                        
                        # Extract the function call information for a better fallback message
                        function_data = {}
                        for item in response.output:
                            if item.type == "function_call":
                                function_data = {
                                    "name": item.name,
                                    "arguments": json.loads(item.arguments) if hasattr(item, "arguments") else {}
                                }
                        
                        # Parse the result from the function call if available
                        result_data = None
                        for msg in input_messages:
                            if isinstance(msg, dict) and msg.get("type") == "function_call_output":
                                try:
                                    result_data = json.loads(msg.get("output", "{}"))
                                except:
                                    pass
                        
                        # Create a more intelligent fallback message based on function, result, and original user message
                        original_message = message_content.lower()
                        
                        if "error" in str(result_data):
                            assistant_message = f"I'm sorry, I tried to get information about your Canvas data, but encountered an error. The specific error was: {result_data.get('error', 'Unknown error')}"
                        elif function_data.get("name") == "get_courses":
                            if isinstance(result_data, list):
                                # Check if user was asking about modules, assignments, etc.
                                if "module" in original_message:
                                    # Try to find a course that matches their query
                                    nlp_courses = [course for course in result_data if 'nlp' in course.get('name', '').lower() or 'natural language' in course.get('name', '').lower()]
                                    if nlp_courses:
                                        course_names = [course.get('name', 'Unknown') for course in nlp_courses]
                                        assistant_message = f"I found your NLP course(s): {', '.join(course_names)}. However, I encountered an issue retrieving the modules. Please try asking again or be more specific about which course you'd like to see modules for."
                                    else:
                                        course_names = [course.get('name', 'Unknown') for course in result_data]
                                        assistant_message = f"I couldn't find a course with 'NLP' in the name. Your courses are: {', '.join(course_names)}. Could you specify which course you'd like to see modules for?"
                                elif "assignment" in original_message or "homework" in original_message or "due" in original_message:
                                    assistant_message = f"I found your {len(result_data)} courses, but encountered an issue retrieving assignment information. Please try asking again."
                                elif "announcement" in original_message:
                                    assistant_message = f"I found your {len(result_data)} courses, but encountered an issue retrieving announcements. Please try asking again."
                                else:
                                    assistant_message = f"You are enrolled in {len(result_data)} courses: {', '.join([course.get('name', 'Unknown') for course in result_data[:3]])}{'...' if len(result_data) > 3 else ''}."
                            else:
                                assistant_message = "I couldn't find any courses in your Canvas account."
                        elif function_data.get("name") == "get_upcoming_due_dates":
                            if isinstance(result_data, list) and len(result_data) > 0:
                                assistant_message = f"I found {len(result_data)} upcoming assignments due in the next {function_data.get('arguments', {}).get('days', 7)} days."
                            else:
                                assistant_message = f"Good news! You don't have any assignments due in the next {function_data.get('arguments', {}).get('days', 7)} days."
                        else:
                            assistant_message = "I tried to fetch information from your Canvas account, but couldn't generate a proper response. Please try asking in a different way."
                    
                    response_id = current_response.id
                else:
                    # No function calls, use the original response
                    logger.info("No function calls detected, using original response")
                    assistant_message = response.output_text
                    response_id = response.id
            except Exception as api_error:
                logger.error(f"Error in OpenAI API call: {str(api_error)}", exc_info=True)
                assistant_message = "I'm sorry, I'm having trouble understanding your request right now. Please try again or rephrase your question."
                response_id = None
            
            # Create assistant message object
            assistant_chat_message = ChatMessage(
                role=MessageRole.ASSISTANT,
                content=assistant_message,
                timestamp=datetime.utcnow()
            )
            
            # Save assistant message to Firestore
            assistant_message_id = await FirestoreService.save_message(chat_id, assistant_chat_message)
            assistant_chat_message.message_id = assistant_message_id
            
            logger.info(f"Returning assistant message, ID: {assistant_message_id}")
            return assistant_chat_message, response_id, chat_id
            
        except Exception as e:
            # Log the error
            logger.error(f"Chat processing error: {str(e)}", exc_info=True)
            # Return a fallback message
            error_message = ChatMessage(
                role=MessageRole.ASSISTANT,
                content="I'm sorry, I'm having trouble processing your request right now. Please try again later.",
                timestamp=datetime.utcnow()
            )
            
            # If we have a chat_id, try to save the error message
            if chat_id:
                try:
                    await FirestoreService.save_message(chat_id, error_message)
                except Exception:
                    pass  # Silently fail if we can't save the error message
                    
            return error_message, None, chat_id
    
    @staticmethod
    async def _execute_function(name: str, arguments: Dict[str, Any], user_id: str) -> str:
        """
        Execute a function called by the model
        
        Args:
            name: The name of the function to call
            arguments: The arguments to pass to the function
            user_id: The user's ID
            
        Returns:
            The result of the function call as a string
        """
        try:
            # Map function names to methods
            function_map = {
                "get_courses": CanvasTools.get_courses,
                "get_assignments": CanvasTools.get_assignments,
                "get_assignment": CanvasTools.get_assignment,
                "get_upcoming_due_dates": CanvasTools.get_upcoming_due_dates,
                "get_announcements": CanvasTools.get_announcements,
                "get_course_modules": CanvasTools.get_course_modules,
                "get_module_items": CanvasTools.get_module_items,
                "get_user_info": CanvasTools.get_user_info
            }
            
            # Check if the function exists
            if name not in function_map:
                logger.warning(f"Function {name} not found in function map")
                return json.dumps({"error": f"Function {name} not found"})
            
            # Call the function with the arguments
            logger.info(f"Calling function {name} with arguments {arguments}")
            function = function_map[name]
            result = await function(user_id, **arguments)
            
            # Log a sample of the result (first 100 chars)
            result_sample = result[:100] + "..." if len(result) > 100 else result
            logger.info(f"Function {name} returned result: {result_sample}")
            
            return result
        except Exception as e:
            # Log the error
            logger.error(f"Error executing function {name}: {str(e)}", exc_info=True)
            # Return the error as a string
            return json.dumps({"error": f"Function execution error: {str(e)}"})
    
    @staticmethod
    async def get_user_chats(user_id: str) -> List[Dict]:
        """Get all chats for a user"""
        return await FirestoreService.get_user_chats(user_id)
    
    @staticmethod
    async def get_chat_messages(chat_id: str) -> List[Dict]:
        """Get all messages for a chat"""
        return await FirestoreService.get_chat_messages(chat_id)
    
    @staticmethod
    async def create_chat(user_id: str, title: str) -> str:
        """Create a new empty chat"""
        return await FirestoreService.create_chat(user_id, title)
    
    @staticmethod
    async def update_chat_title(chat_id: str, title: str) -> bool:
        """Update a chat's title"""
        return await FirestoreService.update_chat_title(chat_id, title)
    
    @staticmethod
    async def delete_chat(chat_id: str) -> bool:
        """Delete a chat and all its messages"""
        return await FirestoreService.delete_chat(chat_id) 