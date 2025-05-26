from pydantic import BaseModel, Field
from enum import Enum
from typing import List, Optional, Dict, Any, Union
from datetime import datetime


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class MessageType(str, Enum):
    TEXT = "text"
    FUNCTION_CALL = "function_call"
    FUNCTION_CALL_OUTPUT = "function_call_output"


class ChatMessage(BaseModel):
    role: MessageRole
    content: str
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)
    message_id: Optional[str] = None
    type: Optional[MessageType] = MessageType.TEXT
    # Function call fields
    name: Optional[str] = None  # For function calls
    arguments: Optional[str] = None  # JSON-encoded arguments
    call_id: Optional[str] = None  # For linking function calls and results
    output: Optional[str] = None  # For function call results


class ChatRequest(BaseModel):
    message: str
    previous_response_id: Optional[str] = None
    chat_id: Optional[str] = None  # ID of the chat this message belongs to
    previous_messages: Optional[List[ChatMessage]] = None  # Previous messages when resuming a chat


class ChatResponse(BaseModel):
    message: ChatMessage
    response_id: str
    chat_id: Optional[str] = None  # ID of the chat this message belongs to


class Chat(BaseModel):
    chat_id: str
    user_id: str
    title: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    messages: List[ChatMessage] = []


class ChatListItem(BaseModel):
    chat_id: str
    title: str
    created_at: datetime
    updated_at: datetime
    last_message: Optional[str] = None


class ChatList(BaseModel):
    chats: List[ChatListItem] = [] 