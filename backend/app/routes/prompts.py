from fastapi import APIRouter, HTTPException, Body
from typing import List
from app.models.prompt import Prompt
from app.utils.db import db
from bson import ObjectId

router = APIRouter(prefix="/api/prompts", tags=["Prompts"])

@router.get("/", response_model=List[Prompt])
async def get_prompts():
    prompts_collection = db.get_db()["prompts"]
    prompts = await prompts_collection.find().to_list(100)
    return prompts

@router.post("/", response_model=Prompt)
async def create_prompt(prompt: Prompt):
    prompts_collection = db.get_db()["prompts"]
    new_prompt = await prompts_collection.insert_one(prompt.model_dump(by_alias=True, exclude=["id"]))
    created_prompt = await prompts_collection.find_one({"_id": new_prompt.inserted_id})
    return created_prompt

@router.put("/{prompt_id}", response_model=Prompt)
async def update_prompt(prompt_id: str, prompt: Prompt):
    prompts_collection = db.get_db()["prompts"]
    try:
        oid = ObjectId(prompt_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Prompt ID")
        
    update_result = await prompts_collection.update_one(
        {"_id": oid},
        {"$set": prompt.model_dump(by_alias=True, exclude=["id"])}
    )
    
    if update_result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Prompt not found")
        
    updated_prompt = await prompts_collection.find_one({"_id": oid})
    return updated_prompt

@router.delete("/{prompt_id}")
async def delete_prompt(prompt_id: str):
    prompts_collection = db.get_db()["prompts"]
    try:
        oid = ObjectId(prompt_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Prompt ID")
        
    delete_result = await prompts_collection.delete_one({"_id": oid})
    
    if delete_result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Prompt not found")
        
    return {"message": "Prompt deleted"}

@router.post("/seed")
async def seed_prompts():
    prompts_collection = db.get_db()["prompts"]
    
    # Check if prompts already exist
    count = await prompts_collection.count_documents({})
    if count > 0:
        return {"message": "Prompts already exist", "count": count}
        
    default_prompts = [
        {
            "type": "categorization",
            "template": "Analyze the email content and categorize it into one of the following: Important, Work, Personal, Newsletter, Spam. Return only the category name.",
            "is_active": True
        },
        {
            "type": "summarization",
            "template": "Summarize the following email in 2-3 concise sentences. Focus on the main action items and key information.",
            "is_active": True
        },
        {
            "type": "reply",
            "template": "Draft a polite and professional reply to this email. Address the sender by name if possible. Keep the tone helpful and concise.",
            "is_active": True
        }
    ]
    
    result = await prompts_collection.insert_many(default_prompts)
    return {"message": "Prompts seeded successfully", "count": len(result.inserted_ids)}
