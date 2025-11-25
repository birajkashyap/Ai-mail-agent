import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import pprint

async def check_drafts():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    print("Checking drafts collection...")
    count = await db.drafts.count_documents({})
    print(f"Total drafts: {count}")
    
    cursor = db.drafts.find()
    async for doc in cursor:
        pprint.pprint(doc)
            
    client.close()

if __name__ == "__main__":
    asyncio.run(check_drafts())
