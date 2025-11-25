from fastapi import APIRouter, HTTPException
from typing import List
from app.models.email import Email
from app.services.ingestion import ingest_mock_data
from app.utils.db import db

router = APIRouter(prefix="/api/emails", tags=["Emails"])

@router.post("/ingest")
async def ingest_emails():
    try:
        result = await ingest_mock_data()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[Email])
async def get_emails():
    emails_collection = db.get_db()["emails"]
    emails = await emails_collection.find().sort("timestamp", -1).to_list(100)
    return emails

@router.get("/{email_id}", response_model=Email)
async def get_email(email_id: str):
    emails_collection = db.get_db()["emails"]
    # We need to handle ObjectId conversion here or in the query
    # For now, let's assume the ID is passed as a string and we might need to convert it if we were using ObjectId directly in find_one
    # But since we are using Pydantic models with PyObjectId, we might need to be careful.
    # Let's try to import ObjectId
    from bson import ObjectId
    try:
        oid = ObjectId(email_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Email ID")
        
    email = await emails_collection.find_one({"_id": oid})
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    return email
