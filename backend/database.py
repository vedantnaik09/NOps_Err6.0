# database.py
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "chat_db"

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

conversations_collection = db["conversations"]