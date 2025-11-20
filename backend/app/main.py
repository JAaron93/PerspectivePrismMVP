from fastapi import FastAPI
from app.core.config import settings

app = FastAPI(title="Perspective Prism MVP")

@app.get("/")
def read_root():
    return {"message": "Welcome to Perspective Prism MVP API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
