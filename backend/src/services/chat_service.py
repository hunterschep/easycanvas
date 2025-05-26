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
            
            # Create base kwargs for the API call
            kwargs = {
                # O4 model has a large context window (up to 128k tokens)
                "model": "o4-mini-2025-04-16",
                "store": True,  # Store the conversation for 30 days
                "tools": CANVAS_TOOLS,  # Add function definitions
                "reasoning": {  # Required for o4-mini with function calling
                    "effort": "medium"
                },
            }
            
            # If there are previous messages, use them for context
            if previous_messages and len(previous_messages) > 0:
                # Format messages for OpenAI
                formatted_messages = [{
                    "role": "system",
                    "content": SYSTEM_MESSAGE_WITH_TOOLS
                }]
                
                for msg in previous_messages:
                    # Handle regular messages
                    if not hasattr(msg, 'type') or msg.type is None:
                        formatted_messages.append({
                            "role": msg.role,
                            "content": msg.content
                        })
                
                # Add the current user message
                formatted_messages.append({
                    "role": "user",
                    "content": message_content
                })
                
                # Use the formatted messages for context
                logger.info(f"Using {len(previous_messages)} previous messages for context in a continuous conversation")
                kwargs["input"] = formatted_messages
                
            # If no previous messages but we have a response ID, use that for context
            elif previous_response_id:
                # Check if the previous_response_id is in a valid format (starts with 'resp_')
                if previous_response_id and previous_response_id.startswith('resp_'):
                    logger.info(f"Using previous response ID for context: {previous_response_id}")
                    kwargs["previous_response_id"] = previous_response_id
                    kwargs["input"] = [
                        {"role": "system", "content": SYSTEM_MESSAGE_WITH_TOOLS},
                        {"role": "user", "content": message_content}
                    ]
                else:
                    # Invalid response ID format, just use the input without previous_response_id
                    logger.warning(f"Invalid previous_response_id format: {previous_response_id}, ignoring it")
                    kwargs["input"] = [
                        {"role": "system", "content": SYSTEM_MESSAGE_WITH_TOOLS},
                        {"role": "user", "content": message_content}
                    ]
            else:
                # For a new conversation, just use the message content with system message
                logger.info("Starting new conversation")
                kwargs["input"] = [
                    {"role": "system", "content": SYSTEM_MESSAGE_WITH_TOOLS},
                    {"role": "user", "content": message_content}
                ]
            
            # First call to get potential function calls
            logger.info("Making initial API call to OpenAI")
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
                # Process function calls
                input_messages = kwargs["input"].copy()
                
                # First, add all items from the response output to preserve reasoning items
                for item in response.output:
                    logger.info(f"Adding output item of type {item.type} to messages")
                    input_messages.append(item)
                
                # Then process function calls and add results
                for item in response.output:
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
                
                # Make a second call with the function results
                logger.info("Making second API call with function results")
                kwargs["input"] = input_messages
                response_2 = await loop.run_in_executor(
                    executor,
                    partial(client.responses.create, **kwargs)
                )
                
                # Use the new response with function results
                logger.info(f"Second response received, ID: {response_2.id}")
                assistant_message = response_2.output_text
                logger.info(f"Response message length: {len(assistant_message) if assistant_message else 0}")
                
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
                    
                    # Create a fallback message based on function and result
                    if "error" in str(result_data):
                        assistant_message = f"I'm sorry, I tried to get information about your Canvas data, but encountered an error. The specific error was: {result_data.get('error', 'Unknown error')}"
                    elif function_data.get("name") == "get_upcoming_due_dates":
                        if isinstance(result_data, list) and len(result_data) > 0:
                            assistant_message = f"I found {len(result_data)} upcoming assignments due in the next {function_data.get('arguments', {}).get('days', 7)} days."
                        else:
                            assistant_message = f"Good news! You don't have any assignments due in the next {function_data.get('arguments', {}).get('days', 7)} days."
                    elif function_data.get("name") == "get_courses":
                        if isinstance(result_data, list):
                            assistant_message = f"I found {len(result_data)} courses in your Canvas account."
                        else:
                            assistant_message = "I couldn't find any courses in your Canvas account."
                    else:
                        assistant_message = "I tried to fetch information from your Canvas account, but couldn't generate a proper response. Please try asking in a different way."
                
                response_id = response_2.id
            else:
                # No function calls, use the original response
                logger.info("No function calls detected, using original response")
                assistant_message = response.output_text
                response_id = response.id
            
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