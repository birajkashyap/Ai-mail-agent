import asyncio
from app.utils.db import db
from app.models.prompt import Prompt

DEFAULT_PROMPTS = [
    {
        "name": "Default Categorization",
        "type": "categorization",
        "template": "Categorize emails into: Important, Newsletter, Spam, To-Do. To-Do emails must include a direct request requiring user action. Return only the category name.",
        "is_active": True
    },
    {
        "name": "Default Action Extraction",
        "type": "extraction",
        "template": "Extract tasks from the email. Respond in JSON format: { \"tasks\": [ { \"task\": \"...\", \"deadline\": \"...\", \"priority\": \"High/Medium/Low\" } ] }. If no tasks, return { \"tasks\": [] }.",
        "is_active": True
    },
    {
        "name": "Default Auto-Reply",
        "type": "reply",
        "template": "Draft a polite and professional reply. Address the sender by name if possible. Keep it concise.",
        "is_active": True
    },
    {
        "name": "Default Chat",
        "type": "chat",
        "template": "You are a helpful email assistant. Answer questions based on the email context provided.",
        "is_active": True
    }
]

async def seed_prompts():
    db.connect()
    prompts_collection = db.get_db()["prompts"]
    
    for prompt_data in DEFAULT_PROMPTS:
        existing = await prompts_collection.find_one({"type": prompt_data["type"]})
        if not existing:
            print(f"Seeding prompt: {prompt_data['name']}")
            prompt = Prompt(**prompt_data)
            await prompts_collection.insert_one(prompt.model_dump(by_alias=True, exclude=["id"]))
        else:
            print(f"Prompt already exists: {prompt_data['name']}")
            
    db.close()

if __name__ == "__main__":
    asyncio.run(seed_prompts())
