from fastapi import APIRouter, Depends, HTTPException
from src.models.chat import ChatRequest, ChatResponse, ChatMessage, ChatList, Chat
from src.services.chat_service import ChatService
from src.api.middleware.auth import verify_firebase_token
from typing import List

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user_id: str = Depends(verify_firebase_token)
):
    """
    Process a chat message and return a response
    
    If chat_id is provided, adds to an existing chat
    Otherwise creates a new chat
    
    Optional previous_response_id can be provided to maintain conversation context
    """
    try:
        # Generate response from OpenAI
        response_message, response_id, chat_id = await ChatService.generate_response(
            message_content=request.message, 
            user_id=user_id,
            chat_id=request.chat_id,
            previous_response_id=request.previous_response_id
        )
        
        # Return the response with chat_id
        return ChatResponse(
            message=response_message, 
            response_id=response_id or "unknown",  # Provide a default if None
            chat_id=chat_id
        )
    except Exception as e:
        # Log the error
        print(f"Error processing chat request: {str(e)}")
        # Create a fallback response
        error_message = ChatMessage(
            role="assistant",
            content="I'm sorry, I encountered an error processing your request.",
            timestamp=None
        )
        return ChatResponse(
            message=error_message,
            response_id="error",
            chat_id=request.chat_id or "error"
        )


@router.get("/chats", response_model=ChatList)
async def get_user_chats(
    user_id: str = Depends(verify_firebase_token)
):
    """Get all chats for a user"""
    chats = await ChatService.get_user_chats(user_id)
    return ChatList(chats=chats)


@router.get("/chats/{chat_id}/messages", response_model=List[ChatMessage])
async def get_chat_messages(
    chat_id: str,
    user_id: str = Depends(verify_firebase_token)
):
    """Get all messages for a chat"""
    messages = await ChatService.get_chat_messages(chat_id)
    return messages


@router.post("/chats", response_model=dict)
async def create_chat(
    title: str,
    user_id: str = Depends(verify_firebase_token)
):
    """Create a new empty chat"""
    chat_id = await ChatService.create_chat(user_id, title)
    return {"chat_id": chat_id}


@router.put("/chats/{chat_id}/title")
async def update_chat_title(
    chat_id: str,
    title: str,
    user_id: str = Depends(verify_firebase_token)
):
    """Update a chat's title"""
    success = await ChatService.update_chat_title(chat_id, title)
    if not success:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"success": True}


@router.delete("/chats/{chat_id}")
async def delete_chat(
    chat_id: str,
    user_id: str = Depends(verify_firebase_token)
):
    """Delete a chat and all its messages"""
    success = await ChatService.delete_chat(chat_id)
    if not success:
        raise HTTPException(status_code=404, detail="Chat not found")
    return {"success": True} 