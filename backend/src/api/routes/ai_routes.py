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
            temperature=0.5,
            messages=[{
                "role": "user",
                "content": [{
                    "type": "text",
                    "text": f"""You are tasked with reorganizing a Canvas LMS assignment into a clean, detailed, and actionable description. Your goal is to create a concise yet comprehensive summary that helps students understand the assignment requirements in detail and take appropriate action.

                        Here is the assignment description you need to analyze:

                        ASSIGNMENT DESCRIPTION:
                        {text}

                        To create an effective analysis, follow these guidelines:

                        1. Carefully read and analyze the entire assignment description first. 

                        2. Identify and include the following key elements in your summary:
                        a. Assignment title and key information 

                        BIGGEST SECTIONS:
                        c. Key tasks or components students need to complete
                            c1. Walk through each taks or component and describe it in detail
                        d. Specific requirements 
                        e. Due date and submission instructions
                        f. Grading criteria or rubric highlights (if provided)

                        3. Format your summary in a clear, easy-to-read structure:
                        - Use bullet points or numbered lists for individual tasks or requirements
                        - Ensure sentences are descriptive and that your summary flows logically 
                        - Use complete and clear sentences with proper grammar and punctuation
                        - Use headings to separate different sections if necessary

                        4. Make the summary actionable:
                        - Use imperative verbs to start sentences or bullet points (e.g., "Write," "Analyze," "Submit")
                        - Clearly state what students need to do for each part of the assignment
                        - Include any important deadlines or milestones
                        - Include any important links formatted correctly for the student to click 

                        5. Ensure your write up is:
                        - Objective and faithful to the original assignment description
                        - Free of personal opinions or interpretations
                        - Written in a neutral, instructional tone
                        - Full of good descriptions, analysis, and recommendations that improves upon the original assignment description 

                        6. Getting started section: 
                        IMPORTANT: This is tips for the student on how to get started approaching this assignment, be very detailed! 
                            - Use sentences and bullet points to make it easy to read and understand
                            - Walk through at a high level how to get started on the assignment
                            - Include any important resources or tools that the student needs to use

                        7. After creating the summary, review it to ensure all crucial information is included and that it provides a clear, actionable guide for students.

                        Please provide your summary as markdown code, do not include any backticks or other formatting.

                        """
                }]
            }],
            system="You are a helpful teaching assistant. Format your response in Markdown with clear sections, bullet points, and emphasis on key information. Be thorough."
        )
        
        logger.info("Successfully received response from Anthropic")
        logger.info(f"Response: {message.content[0].text}")
        return {"summary": message.content[0].text}
        
    except Exception as e:
        logger.error(f"Error in summarize_text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

