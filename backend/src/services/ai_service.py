from anthropic import Anthropic
from src.config.settings import get_settings

settings = get_settings()
anthropic = Anthropic(api_key=settings.ANTHROPIC_API_KEY)

class AIService:
    @staticmethod
    async def summarize_text(text: str) -> str:
        try:
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
            
            return message.content[0].text
        except Exception as e:
            raise Exception(f"Anthropic API error: {str(e)}")