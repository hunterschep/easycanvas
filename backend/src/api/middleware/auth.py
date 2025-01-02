from fastapi import Header, HTTPException
from firebase_admin import auth
import logging

logger = logging.getLogger(__name__)

async def verify_firebase_token(authorization: str = Header(...)):
    try:
        if not authorization.startswith('Bearer '):
            logger.error("Authorization header missing Bearer prefix")
            raise HTTPException(status_code=401, detail="Invalid authorization format")
            
        token = authorization.split("Bearer ")[1]
        logger.info("Attempting to verify Firebase token")
        
        try:
            decoded_token = auth.verify_id_token(token)
            logger.info(f"Successfully verified token for user: {decoded_token['uid']}")
            return decoded_token['uid']
        except Exception as e:
            logger.error(f"Firebase token verification failed: {str(e)}")
            raise HTTPException(status_code=401, detail="Invalid token")
            
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid authentication")