from fastapi import FastAPI

from app.api.auth import router as auth_router

app = FastAPI(
    title="StudyMind AI API"
)

app.include_router(
    auth_router,
    prefix="/api/auth",
    tags=["Authentication"],
)


@app.get("/")
def root():

    return {
        "message": "StudyMind AI API"
    }