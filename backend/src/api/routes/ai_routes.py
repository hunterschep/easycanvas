from fastapi import APIRouter, HTTPException
from anthropic import Anthropic
from src.config.settings import get_settings
import json
import logging

logger = logging.getLogger(__name__)
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
                    "text": f"""Summarize this Canvas assignment description concisely. Focus on key requirements, deadlines, and deliverables. Keep it brief but informative. Include emojis and put it in html format as that is how it will be rendered!:

{text}"""
                }]
            }],
            system="You are a helpful teaching assistant that summarizes Canvas assignments clearly and concisely."
        )
        
        logger.info("Successfully received response from Anthropic")
        return {"summary": message.content[0].text}
        
    except Exception as e:
        logger.error(f"Error in summarize_text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

