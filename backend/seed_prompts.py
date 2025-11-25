import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.models.prompt import Prompt

async def seed_prompts():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    default_prompts = [
        {
            "name": "Categorization Prompt",
            "type": "categorization",
            "template": "Analyze the email content and categorize it into one of the following: 'Important', 'To-Do', 'Spam', 'Newsletter', or 'General'. Return only the category name.",
            "is_active": True
        },
        {
            "name": "Summarization Prompt",
            "type": "summarization",
            "template": "Summarize the following email in 2-3 sentences. Focus on the main point and any deadlines.",
            "is_active": True
        },
        {
            "name": "Action Item Extraction Prompt",
            "type": "extraction",
            "template": "Extract any action items or tasks from the email. Return a JSON list of objects with 'task', 'deadline' (if any), and 'priority' (High/Medium/Low).",
            "is_active": True
        },
        {
            "name": "Reply Generation Prompt",
            "type": "reply",
            "template": "Draft a professional and polite reply to this email based on the user's instructions. Keep it concise.",
            "is_active": True
        }
    ]
    
    print("Seeding prompts...")
    for p_data in default_prompts:
        existing = await db.prompts.find_one({"type": p_data["type"]})
        if not existing:
            prompt = Prompt(**p_data)
            await db.prompts.insert_one(prompt.model_dump(by_alias=True))
            print(f"Inserted: {p_data['name']}")
        else:
            print(f"Skipped (exists): {p_data['name']}")
            
    print("Done.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_prompts())
