from openai import OpenAI
from datetime import datetime
import asyncio
from functools import partial
from concurrent.futures import ThreadPoolExecutor
from src.models.chat import ChatMessage, MessageRole
from src.services.firestore_service import FirestoreService
from src.config.settings import get_settings
from typing import Optional, List, Dict, Tuple

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
                "model": "o4-mini-2025-04-16",
                "store": True,  # Store the conversation for 30 days
            }
            
            # If there are previous messages, use them for context
            if previous_messages and len(previous_messages) > 0:
                # Format messages for OpenAI
                formatted_messages = []
                for msg in previous_messages:
                    # Ensure we only include the necessary fields for OpenAI
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
                print(f"Using {len(formatted_messages)} previous messages for context")
                kwargs["input"] = formatted_messages
                
            # If no previous messages but we have a response ID, use that for context
            elif previous_response_id:
                print(f"Using previous response ID for context: {previous_response_id}")
                kwargs["previous_response_id"] = previous_response_id
                kwargs["input"] = [{"role": "user", "content": message_content}]
            else:
                # For a new conversation, just use the message content
                print("Starting new conversation")
                kwargs["input"] = message_content
            
            response = await loop.run_in_executor(
                executor,
                partial(client.responses.create, **kwargs)
            )
            
            # Extract the assistant's message from the response
            assistant_message = response.output_text
            
            # Create assistant message object
            assistant_chat_message = ChatMessage(
                role=MessageRole.ASSISTANT,
                content=assistant_message,
                timestamp=datetime.utcnow()
            )
            
            # Save assistant message to Firestore
            assistant_message_id = await FirestoreService.save_message(chat_id, assistant_chat_message)
            assistant_chat_message.message_id = assistant_message_id
            
            return assistant_chat_message, response.id, chat_id
            
        except Exception as e:
            # Log the error
            print(f"Chat processing error: {e}")
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