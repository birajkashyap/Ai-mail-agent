import json
import os
from typing import List
from app.utils.db import db
from app.models.email import Email
from datetime import datetime

MOCK_DATA_PATH = "../../../data/mock_inbox.json"

from app.services.processing import process_unprocessed_emails

async def ingest_mock_data():
    # Construct absolute path relative to this file
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, MOCK_DATA_PATH)
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Mock data file not found at {file_path}")

    with open(file_path, "r") as f:
        data = json.load(f)

    emails_collection = db.get_db()["emails"]
    
    new_emails = 0
    for item in data:
        # Check if email already exists (simple check by subject + timestamp)
        # In a real app, we'd use a unique ID or message-id
        timestamp = datetime.fromisoformat(item["timestamp"].replace("Z", "+00:00"))
        existing = await emails_collection.find_one({
            "subject": item["subject"],
            "timestamp": timestamp
        })
        
        if not existing:
            email = Email(
                sender=item["sender"],
                subject=item["subject"],
                body=item["body"],
                timestamp=timestamp,
                is_read=False,
                processed=False
            )
            await emails_collection.insert_one(email.model_dump(by_alias=True, exclude=["id"]))
            new_emails += 1
            
    # Trigger processing
    processed_count = await process_unprocessed_emails()
            
    return {"message": f"Ingested {new_emails} new emails and processed {processed_count} emails"}
