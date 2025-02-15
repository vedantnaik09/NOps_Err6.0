from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from bson import ObjectId

class Message(BaseModel):
    sender: str  # "user" or "bot"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    message_type: str = "text"  # "text" or "file"

class Chat(BaseModel):
    user_id: str
    title: str
    messages: List[Message] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)