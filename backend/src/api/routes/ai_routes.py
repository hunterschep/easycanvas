from fastapi import APIRouter, HTTPException
from anthropic import Anthropic
from src.config.settings import get_settings
import json

router = APIRouter()
settings = get_settings()

anthropic = Anthropic(api_key=settings.ANTHROPIC_API_KEY)

@router.post("/summarize")
async def summarize_text(request: dict):
    try:
        text = request.get('text')
        if not text:
            raise HTTPException(status_code=400, detail="No text provided")

        message = await anthropic.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": f"""Summarize this Canvas assignment description concisely. Focus on key requirements, deadlines, and deliverables. Keep it brief but informative:

{text}"""
            }],
            system="You are a helpful teaching assistant that summarizes Canvas assignments clearly and concisely."
        )
        
        return {"summary": message.content[0].text}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

