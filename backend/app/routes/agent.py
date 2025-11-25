from fastapi import APIRouter, HTTPException, Body
from app.services.llm_service import llm_service
from app.utils.db import db
from app.models.draft import Draft
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/agent", tags=["Agent"])

@router.post("/chat")
async def chat_agent(payload: dict = Body(...)):
    message = payload.get("message")
    email = payload.get("email")
    context = payload.get("context", "")
    
    if not message:
        raise HTTPException(status_code=400, detail="Message is required")
        
    email_content = ""
    if email:
        email_content = f"Subject: {email.get('subject', 'No Subject')}\nFrom: {email.get('sender', 'Unknown')}\nBody:\n{email.get('body', '')}\n"
            
    prompt = f"""
You are an AI email assistant.

Here is the email the user is asking about:

{email_content}

User message: {message}
Context: {context}
"""
    response = await llm_service.generate_text(prompt, system_prompt="You are a helpful email assistant.")
    
    return {"response": response}

@router.post("/draft")
async def generate_draft(payload: dict = Body(...)):
    email = payload.get("email")
    instructions = payload.get("instructions", "")
    
    if not email:
        raise HTTPException(status_code=400, detail="Email object is required")
        
    # Fetch Reply Prompt
    prompts_collection = db.get_db()["prompts"]
    reply_prompt_doc = await prompts_collection.find_one({"type": "reply", "is_active": True})
    reply_prompt_text = reply_prompt_doc["template"] if reply_prompt_doc else "Draft a polite reply to this email."
    
    prompt = f"""
Original Email:
Subject: {email.get('subject', 'No Subject')}
From: {email.get('sender', 'Unknown')}
Body: {email.get('body', '')}

Instructions: {instructions}

{reply_prompt_text}
"""
    
    draft_content = await llm_service.generate_text(prompt, system_prompt="You are an email drafting assistant.")
    
    # Create Draft
    # Note: We still need an email_id for the draft record. 
    # If it's a mock email, we might not have a valid ObjectId.
    # We will try to use the provided _id, or generate a new one if invalid.
    email_id_str = email.get('_id')
    try:
        oid = ObjectId(email_id_str)
    except:
        oid = ObjectId() # Generate a new ID if invalid/mock
    
    draft = Draft(
        email_id=oid,
        subject=f"Re: {email.get('subject', 'No Subject')}",
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
