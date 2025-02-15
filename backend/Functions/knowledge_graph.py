import os
from dotenv import load_dotenv
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from typing import Optional, Dict, Any
from llama_index.core import SimpleDirectoryReader, KnowledgeGraphIndex, VectorStoreIndex
from llama_index.core.graph_stores import SimpleGraphStore
from llama_index.llms.gemini import Gemini
from llama_index.core import Settings
from llama_index.embeddings.gemini import GeminiEmbedding
from llama_index.core import StorageContext, load_index_from_storage
from pyvis.network import Network

# Load environment variables
load_dotenv()
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")
mongo_client = AsyncIOMotorClient(os.getenv("MONGO_URI"))
db = mongo_client.chatbot_db

# Initialize LLM and Embedding Model
llm = Gemini(temperature=0, model="models/gemini-2.0-flash")
Settings.llm = llm
Settings.embed_model = GeminiEmbedding(
    model_name="models/embedding-001", api_key=os.getenv("GOOGLE_API_KEY")
)
Settings.chunk_size = 512

async def save_chat_message(user_id: str, conversation_id: Optional[str], user_message: str, bot_response: str, message_type: str = "text") -> str:
    """Save chat messages to MongoDB and return conversation_id"""
    chats = db.chats
    
    if not conversation_id:
        # Create new conversation
        new_chat = {
            "user_id": user_id,
            "title": user_message[:30] + "..." if len(user_message) > 30 else user_message,
            "messages": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = await chats.insert_one(new_chat)
        conversation_id = str(result.inserted_id)
    
    # Add messages
    messages = [
        {
            "sender": "user",
            "content": user_message,
            "timestamp": datetime.utcnow(),
            "message_type": message_type
        },
        {
            "sender": "bot",
            "content": bot_response,
            "timestamp": datetime.utcnow(),
            "message_type": "text"
        }
    ]
    
    await chats.update_one(
        {"_id": ObjectId(conversation_id)},
        {
            "$push": {"messages": {"$each": messages}},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    return conversation_id

def process_pdf_visualization(pdf_path: str, user_id: str, conversation_id: str) -> str:
    """
    Process a PDF file to generate a knowledge graph (for visualization) 
    and a vector index (for RAG), persisting both in a unique folder.
    """
    # Create unique storage directory
    persist_dir = os.path.join("./storage", f"{user_id}_{conversation_id}")
    os.makedirs(persist_dir, exist_ok=True)

    # Load documents once
    documents = SimpleDirectoryReader(pdf_path).load_data()

    # 1. Create Knowledge Graph Index for visualization
    graph_storage = StorageContext.from_defaults(graph_store=SimpleGraphStore())
    kg_index = KnowledgeGraphIndex.from_documents(
        documents,
        max_triplets_per_chunk=1,
        storage_context=graph_storage,
    )
    
    # Generate visualization HTML
    g = kg_index.get_networkx_graph()
    net = Network(notebook=True, cdn_resources="in_line", directed=True)
    net.from_nx(g)
    html_str = net.generate_html()

    # 2. Create Vector Store Index for RAG
    vector_storage = StorageContext.from_defaults()
    VectorStoreIndex.from_documents(
        documents,
        storage_context=vector_storage
    )
    vector_storage.persist(persist_dir=persist_dir)

    return html_str

async def process_pdf(pdf_path: str, user_id: str, conversation_id: Optional[str], filename: str) -> Dict[str, Any]:
    """Process PDF and store chat in MongoDB"""
    try:
        # Always create a new conversation if conversation_id is not provided
        if not conversation_id:
            conversation_id = str(ObjectId())
        
        # Process PDF with conversation ID
        html_str = process_pdf_visualization(pdf_path, user_id, conversation_id)
        
        # Save to chat history with the same conversation ID
        message = f"Uploaded PDF: {filename}"
        await save_chat_message(
            user_id=user_id,
            conversation_id=conversation_id,
            user_message=message,
            bot_response="PDF processed successfully! You can now ask questions about its content.",
            message_type="file"
        )
        
        return {
            "html": html_str,
            "conversation_id": conversation_id,
            "content": "PDF processed successfully! You can now ask questions about its content.",
            "status": "success"
        }
    
    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        return {
            "html": "",
            "conversation_id": conversation_id,
            "content": str(e),
            "status": "error"
        }

def load_rag_index(user_id: str, conversation_id: str):
    """
    Load the vector store index for RAG queries
    """
    persist_dir = os.path.join("./storage", f"{user_id}_{conversation_id}")
    storage_context = StorageContext.from_defaults(persist_dir=persist_dir)
    return load_index_from_storage(storage_context)

async def process_text(query: str, user_id: str, conversation_id: Optional[str] = None) -> Dict[str, Any]:
    """Process text query and store chat in MongoDB"""
    try:
        # Original RAG processing
        index = load_rag_index(user_id, conversation_id)
        if not index:
            raise Exception("Index not found. Please upload a PDF first.")
        
        query_engine = index.as_query_engine()
        response = query_engine.query(query)
        
        # Save to chat history
        conversation_id = await save_chat_message(
            user_id=user_id,
            conversation_id=conversation_id,
            user_message=query,
            bot_response=response.response
        )
        
        return {
            "response": response.response,
            "conversation_id": conversation_id,
            "status": "success"
        }
    
    except Exception as e:
        print(f"Error processing text: {str(e)}")
        return {
            "response": str(e),
            "conversation_id": conversation_id,
            "status": "error"
        }