from fastapi import APIRouter, HTTPException
from anthropic import Anthropic
from src.config.settings import get_settings
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
        temperature=0.5,
        messages=[
            {
                "role": "user",
                "content": [{
                    "type": "text",
                    "text": f"""
                        You are tasked with reorganizing a Canvas LMS assignment into a **clean**, **detailed**, and **actionable** description—**like a project manager**. Your goal is to create a **concise yet comprehensive** summary that helps students understand the assignment requirements thoroughly and plan their approach step-by-step.

                        **ASSIGNMENT DESCRIPTION:**
                        {text}

                        ## Instructions for Your Analysis

                        1. **Read and Analyze**  
                        - Carefully review the entire assignment description above.
                        - Understand the main goal, scope, and deliverables.

                        2. **Identify Key Elements**  
                        - **Assignment Title and Key Information**  
                        - **Key Tasks or Components**  
                            - Break down each task or component, describing it in detail.  
                        - **Specific Requirements**  
                        - **Due Date and Submission Instructions**  
                        - **Grading Criteria or Rubric Highlights (if provided)**  

                        3. **Provide Clear Organization**  
                        - Use bullet points, headings, or numbered lists for tasks and requirements.  
                        - Write with logical flow, proper grammar, and easy-to-read structure.

                        4. **Make it Actionable**  
                        - Start bullet points or instructions with imperative verbs (e.g., “Outline…”, “Analyze…”, “Submit…”).  
                        - Clearly state what students need to do for each part of the assignment.  
                        - Include any important links or resources, formatted for easy access.

                        5. **Maintain Objectivity**  
                        - Remain faithful to the original description without personal opinions.  
                        - Use a neutral, instructional tone while still providing an **enhanced, more organized version** of the requirements.

                        6. **Getting Started Section (Project Manager’s Tips)**  
                        - Provide a thorough, step-by-step outline on **how to begin** the assignment.  
                        - Recommend **tools**, **resources**, or **techniques** that will help students succeed.  
                        - Give **time management** tips or milestones if relevant (e.g., “Week 1: Research… Week 2: Outline…”).  
                        - Anticipate challenges and offer **workarounds** or **troubleshooting tips**.

                        7. **Review Before Submitting**  
                        - Ensure **all critical information is included**.  
                        - Double-check that your summary is **clear, actionable, and logically organized**.

                        **Output Formatting Requirements**  
                        - Provide your response as **Markdown code** (without backticks).  
                        - Include headings and bullet points as needed.  
                        - Be detailed, use complete sentences, and ensure it is suitable for direct student viewing.

                        Now, please transform the provided assignment description into a refined, step-by-step guide that meets all the criteria above.
                        """
                                    }]
                                }
                            ]
                        )

        
        logger.info("Successfully received response from Anthropic")
        logger.info(f"Response: {message.content[0].text}")
        return {"summary": message.content[0].text}
        
    except Exception as e:
        logger.error(f"Error in summarize_text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

