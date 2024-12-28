from fastapi import FastAPI

app = FastAPI()

# Base endpoint response 
@app.get("/")
def read_root():
    return {"message": "Welcome to EasyCanvas Backend"}

# Endpoint to check validity of CanvasAPI key 



