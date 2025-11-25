from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from bson import ObjectId
from app.models.email import PyObjectId

class Prompt(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str
    type: str  # categorization, extraction, reply, chat
    template: str
    is_active: bool = True

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
