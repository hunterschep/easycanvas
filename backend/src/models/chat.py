from pydantic import BaseModel, Field
from enum import Enum
from typing import List, Optional, Dict, Any
from datetime import datetime


class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatMessage(BaseModel):
    role: MessageRole
    content: str
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)
    message_id: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    previous_response_id: Optional[str] = None
    chat_id: Optional[str] = None  # ID of the chat this message belongs to


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