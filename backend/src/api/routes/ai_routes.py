from fastapi import APIRouter, HTTPException
from anthropic import Anthropic
from src.config.settings import get_settings
import json
from src.utils.logging import setup_logger

logger = setup_logger(__name__)
router = APIRouter()
settings = get_settings()

client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)

@router.post("/summarize")
async def summarize_text(request: dict):
    try:
        logger.info("Received summarize request")
        text = request.get('text')
        if not text:
            logger.error("No text provided in request")
            raise HTTPException(status_code=400, detail="No text provided")

        logger.info("Calling Anthropic API")
        message = client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": [{
                    "type": "text",
                    "text": f"""This canvas assignment description is a bit verbose and confusing! Let's break it down into actionable steps, deliverables, and deadlines. Also hypothesize on how a student could get started on this assignment 
                    
                    Return html code that can be rendered in a web browser. Do not include any backticks or any leading text, just the html! 

                    Here is the assignment description:

{text}"""
                }]
            }],
            system="You are a helpful AI adiminstrative assistant that acts as a detailed Project Manager for tasks assigned to you."
        )
        
        logger.info("Successfully received response from Anthropic")
        return {"summary": message.content[0].text}
        
    except Exception as e:
        logger.error(f"Error in summarize_text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

