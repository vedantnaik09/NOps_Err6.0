# database.py
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "nops"

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

conversations_collection = db["conversations"]
knowledge_graph_html_collection = db["knowledge_graph_html"]
