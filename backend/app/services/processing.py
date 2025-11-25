from app.utils.db import db
from app.services.llm_service import llm_service
from app.models.email import Email
from app.models.prompt import Prompt

async def process_email(email_data: dict):
    # Fetch Prompts
    prompts_collection = db.get_db()["prompts"]
    cat_prompt_doc = await prompts_collection.find_one({"type": "categorization", "is_active": True})
    ext_prompt_doc = await prompts_collection.find_one({"type": "extraction", "is_active": True})
    
    # Default Prompts if not found
    cat_prompt_text = cat_prompt_doc["template"] if cat_prompt_doc else "Categorize this email into: Important, Newsletter, Spam, To-Do. Return only the category name."
    ext_prompt_text = ext_prompt_doc["template"] if ext_prompt_doc else "Extract tasks from the email. Respond in JSON: { \"tasks\": [ { \"task\": \"...\", \"deadline\": \"...\" } ] }."

    # 1. Categorization
    category = await llm_service.categorize_email(
        content=f"Subject: {email_data['subject']}\nBody: {email_data['body']}",
        prompt_template=cat_prompt_text
    )
    
    # 2. Action Extraction
    actions_json = await llm_service.extract_action_items(
        content=email_data['body'],
        prompt_template=ext_prompt_text
    )
    
    # Update Email in DB
    emails_collection = db.get_db()["emails"]
    
    update_data = {
        "processed": True,
        "metadata": {
            "category": category.strip(),
            "action_items": actions_json.get("tasks", []),
            "summary": "Processed by AI"
        }
    }
    
    await emails_collection.update_one(
        {"_id": email_data["_id"]},
        {"$set": update_data}
    )
    
    return update_data

async def process_unprocessed_emails():
    emails_collection = db.get_db()["emails"]
    cursor = emails_collection.find({"processed": False})
    
    processed_count = 0
    async for email in cursor:
        await process_email(email)
        processed_count += 1
        
    return processed_count
