from pydantic import BaseModel, Field, ConfigDict, GetCoreSchemaHandler
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from pydantic_core import core_schema

class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source, handler: GetCoreSchemaHandler):
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.str_schema(),
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda v: str(v),
                return_schema=core_schema.str_schema()
            )
        )

class ActionItem(BaseModel):
    task: str
    deadline: Optional[str] = None
    priority: Optional[str] = "Medium"

class EmailMetadata(BaseModel):
    category: Optional[str] = None
    action_items: List[ActionItem] = []
    summary: Optional[str] = None

class Email(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    sender: str
    subject: str
    body: str
    timestamp: datetime
    is_read: bool = False
    processed: bool = False
    metadata: EmailMetadata = Field(default_factory=EmailMetadata)

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str}
    )
