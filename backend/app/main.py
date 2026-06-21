from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.documents import (router as documents_router)
from app.api.dashboard import router as dashboard_router
from app.api.quizzes import router as quizzes_router

app = FastAPI(
    title="StudyMind AI API"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(
    auth_router,
    prefix="/api/auth",
    tags=["Authentication"],
)

app.include_router(
    users_router,
    prefix="/api/users",
    tags=["Users"],
)


@app.get("/")
def root():
    return {
        "message": "StudyMind AI API"
    }
app.include_router(
    documents_router,
    prefix="/api/documents",
    tags=["Documents"],
)

app.include_router(
    dashboard_router,
    prefix="/api/dashboard",
    tags=["Dashboard"],
)

app.include_router(
    quizzes_router,
    prefix="/api/quizzes",
    tags=["Quizzes"],
)