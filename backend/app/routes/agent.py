from fastapi import APIRouter, HTTPException, Body
from app.services.llm_service import llm_service
from app.utils.db import db
from app.models.draft import Draft
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/agent", tags=["Agent"])

@router.post("/chat")
async def chat_agent(payload: dict = Body(...)):
    query = payload.get("query")
    email_id = payload.get("email_id")
    context = payload.get("context", "")
    
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
        
    email_content = ""
    if email_id:
        try:
            oid = ObjectId(email_id)
            emails_collection = db.get_db()["emails"]
            email = await emails_collection.find_one({"_id": oid})
            if email:
                email_content = f"Email Subject: {email['subject']}\nEmail Body: {email['body']}\n"
        except:
            pass
            
    prompt = f"Context: {context}\n\n{email_content}\nUser Query: {query}"
    response = await llm_service.generate_text(prompt, system_prompt="You are a helpful email assistant.")
    
    return {"response": response}

@router.post("/draft")
async def generate_draft(payload: dict = Body(...)):
    email_id = payload.get("email_id")
    instructions = payload.get("instructions", "")
    
    if not email_id:
        raise HTTPException(status_code=400, detail="Email ID is required")
        
    try:
        oid = ObjectId(email_id)
        emails_collection = db.get_db()["emails"]
        email = await emails_collection.find_one({"_id": oid})
        if not email:
            raise HTTPException(status_code=404, detail="Email not found")
    except:
        raise HTTPException(status_code=400, detail="Invalid Email ID")
        
    # Fetch Reply Prompt
    prompts_collection = db.get_db()["prompts"]
    reply_prompt_doc = await prompts_collection.find_one({"type": "reply", "is_active": True})
    reply_prompt_text = reply_prompt_doc["template"] if reply_prompt_doc else "Draft a polite reply to this email."
    
    prompt = f"Original Email:\nSubject: {email['subject']}\nBody: {email['body']}\n\nInstructions: {instructions}\n\n{reply_prompt_text}"
    
    draft_content = await llm_service.generate_text(prompt, system_prompt="You are an email drafting assistant.")
    
    # Create Draft
    draft = Draft(
        email_id=oid,
        subject=f"Re: {email['subject']}",
        body=draft_content,
        status="generated"
    )
    
    drafts_collection = db.get_db()["drafts"]
    new_draft = await drafts_collection.insert_one(draft.model_dump(by_alias=True, exclude=["id"]))
    
    return {"draft_id": str(new_draft.inserted_id), "content": draft_content}

from typing import List

@router.get("/drafts", response_model=List[Draft])
async def get_drafts():
    drafts_collection = db.get_db()["drafts"]
    drafts = await drafts_collection.find().sort("created_at", -1).to_list(100)
    return drafts
