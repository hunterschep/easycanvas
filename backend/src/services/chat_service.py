from openai import OpenAI
from datetime import datetime
import asyncio
from functools import partial
from concurrent.futures import ThreadPoolExecutor
from src.models.chat import ChatMessage, MessageRole
from src.config.settings import get_settings
from typing import Optional

settings = get_settings()
client = OpenAI(api_key=settings.OPENAI_API_KEY)
executor = ThreadPoolExecutor()


class ChatService:
    @staticmethod
    async def generate_response(message: ChatMessage, previous_response_id: Optional[str] = None) -> tuple[ChatMessage, str]:
        """
        Generate a response using OpenAI API
        
        Args:
            message: The user's message
            previous_response_id: Optional ID of the previous response to maintain conversation context
            
        Returns:
            A tuple containing (ChatMessage response, response_id)
        """
        try:
            # Run the synchronous OpenAI API call in a separate thread to avoid blocking
            loop = asyncio.get_event_loop()
            
            # Create base kwargs for the API call
            kwargs = {
                "model": "o4-mini-2025-04-16",
                "store": True,  # Store the conversation for 30 days
            }
            
            # If there's a previous response ID, use it to maintain conversation context
            if previous_response_id:
                kwargs["previous_response_id"] = previous_response_id
                kwargs["input"] = [{"role": message.role, "content": message.content}]
            else:
                # For a new conversation, just use the message content
                kwargs["input"] = message.content
            
            response = await loop.run_in_executor(
                executor,
                partial(client.responses.create, **kwargs)
            )
            
            # Extract the assistant's message from the response
            assistant_message = response.output_text
            
            return ChatMessage(
                role=MessageRole.ASSISTANT,
                content=assistant_message,
                timestamp=datetime.now()
            ), response.id
        except Exception as e:
            # Log the error
            print(f"OpenAI API error: {e}")
            # Return a fallback message
            return ChatMessage(
                role=MessageRole.ASSISTANT,
                content="I'm sorry, I'm having trouble processing your request right now. Please try again later.",
                timestamp=datetime.now()
            ), None 