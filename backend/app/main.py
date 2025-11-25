from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.utils.db import db
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    db.connect()
    yield
    db.close()

app = FastAPI(title="Email Productivity Agent", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://ai-mail-agent.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.routes import emails, prompts, agent
app.include_router(emails.router)
app.include_router(prompts.router)
app.include_router(agent.router)

@app.get("/")
async def root():
    return {"message": "Email Agent API is running"}
