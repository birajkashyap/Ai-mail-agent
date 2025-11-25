import asyncio
from app.utils.db import db

async def clear_emails():
    db.connect()
    emails_collection = db.get_db()["emails"]
    result = await emails_collection.delete_many({})
    print(f"Deleted {result.deleted_count} emails.")
    db.close()

if __name__ == "__main__":
    asyncio.run(clear_emails())
