from fastapi import FastAPI
from src.api.routes import user_routes, course_routes
from src.api.middleware.security import setup_security_middleware
from src.utils.logging import setup_logger
from src.config.settings import get_settings

# Initialize logging
logger = setup_logger(__name__)
settings = get_settings()

# Initialize FastAPI app
app = FastAPI(
    title="EasyCanvas API",
    description="Backend API for EasyCanvas application",
    version="1.0.0"
)

# Setup security middleware FIRST
setup_security_middleware(app)

# Include routers
app.include_router(user_routes.router, prefix="/api/user", tags=["users"])
app.include_router(course_routes.router, prefix="/api/user/courses", tags=["courses"])

@app.get("/")
def read_root():
    return {"message": "Welcome to EasyCanvas Backend"}