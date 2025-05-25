from fastapi import APIRouter, Depends
from src.models.chat import ChatRequest, ChatResponse, ChatMessage
from src.services.chat_service import ChatService
from src.api.middleware.auth import verify_firebase_token

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user_id: str = Depends(verify_firebase_token)
):
    """
    Process a chat message and return a response
    
    Optional previous_response_id can be provided to maintain conversation context
    """
    # Generate response from OpenAI
    response_message, response_id = await ChatService.generate_response(
        request.message, 
        previous_response_id=request.previous_response_id
    )
    
    # Return the response
    return ChatResponse(message=response_message, response_id=response_id) 