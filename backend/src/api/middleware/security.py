from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from src.config.settings import get_settings
from typing import Callable
import logging

logger = logging.getLogger(__name__)
settings = get_settings()

def setup_security_middleware(app: FastAPI):
    # 1. CORS middleware
    origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(',')]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=3600
    )

    # 2. Security headers (helmet equivalent)
    @app.middleware("http")
    async def security_headers(request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

    # 3. Method check middleware
    @app.middleware("http")
    async def method_check(request: Request, call_next: Callable) -> Response:
        if request.method not in ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]:
            logger.warning(f"Blocked request with method: {request.method}")
            return Response(status_code=405)
        return await call_next(request)

    # Note: Auth check is already handled by verify_firebase_token in auth.py