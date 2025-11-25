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
