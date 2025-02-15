# graph.py
from datetime import datetime
from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException
from security import get_current_user
from fastapi.responses import JSONResponse
from typing import Optional, List
import tempfile
import os
from database import conversations_collection
from Functions.knowledge_graph import process_pdfs, process_text
from bson import ObjectId
from security import get_current_user
from typing import Annotated 
from fastapi.responses import HTMLResponse
from database import knowledge_graph_html_collection 

router = APIRouter()

async def create_conversation(user_id: str, initial_message: dict):
    conversation = {
        "user_id": user_id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "pdf_files": [],
        "messages": [initial_message]
    }
    result = await conversations_collection.insert_one(conversation)
    return str(result.inserted_id)

async def update_conversation(conversation_id: str, message: dict, pdf_files: List[str] = None):
    update_data = {
        "$set": {"updated_at": datetime.utcnow()},
        "$push": {"messages": message}
    }
    
    if pdf_files:
        update_data["$push"]["pdf_files"] = {"$each": pdf_files}
    
    await conversations_collection.update_one(
        {"_id": ObjectId(conversation_id)},
        update_data
    )

# Updated /process-pdfs endpoint
@router.post("/process-pdfs")
async def process_pdfs_endpoint(
    files: List[UploadFile] = File(...),
    user_id: str = Form(...),
    conversation_id: Optional[str] = Form(None)
):
    try:
        pdf_filenames = [file.filename for file in files]
        
        # Create conversation first if doesn't exist
        if not conversation_id:
            conversation_id = await create_conversation(
                user_id=user_id,
                initial_message={
                    "content": "PDF processing started",
                    "role": "system",
                    "timestamp": datetime.utcnow()
                }
            )

        # Now process PDFs with valid conversation_id
        with tempfile.TemporaryDirectory() as temp_dir:
            pdf_paths = []
            for file in files:
                file_path = os.path.join(temp_dir, file.filename)
                with open(file_path, "wb") as f:
                    f.write(await file.read())
                pdf_paths.append(file_path)
            
            result = process_pdfs(pdf_paths, user_id, conversation_id)  # Now has valid ID

        # Update conversation with PDF files and final message
        await conversations_collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$set": {
                "pdf_files": pdf_filenames,
                "updated_at": datetime.utcnow()
            }}
        )
        await update_conversation(
            conversation_id=conversation_id,
            message={
                "content": result["message"],
                "role": "system",
                "timestamp": datetime.utcnow()
            }
        )

        return JSONResponse(content={
            "status": "success",
            "message": result["message"],
            "conversation_id": conversation_id,
            "html": result["html"]
        })

    except Exception as e:
        raise HTTPException(500, f"Processing failed: {str(e)}")
    
@router.post("/query")
async def query_endpoint(
    query: str = Form(..., min_length=1),
    user_id: str = Form(...),
    conversation_id: Optional[str] = Form(None)
):
    try:
        # Process query (your existing code)
        response = process_text(query, user_id, conversation_id)
        
        # Create message objects
        user_message = {
            "content": query,
            "role": "user",
            "timestamp": datetime.utcnow()
        }
        
        bot_message = {
            "content": response,
            "role": "assistant",
            "timestamp": datetime.utcnow()
        }

        # Database operations
        if not conversation_id:
            # Create new conversation
            conversation_id = await create_conversation(
                user_id=user_id,
                initial_message=user_message
            )
            await update_conversation(conversation_id, bot_message)
        else:
            # Update existing conversation
            await update_conversation(conversation_id, user_message)
            await update_conversation(conversation_id, bot_message)

        return JSONResponse(content={
            "response": response,
            "conversation_id": conversation_id
        })

    except Exception as e:
        raise HTTPException(500, f"Query failed: {str(e)}")
    
    # Add to graph.py
@router.get("/chats")
async def get_user_chats(user_id: Annotated[str, Depends(get_current_user)]):
    print(user_id)
    try:
        conversations = []
        async for conv in conversations_collection.find({"user_id": user_id}):
            # Create title from PDF filenames
            title = "New Chat"
            if conv.get("pdf_files"):
                title = ", ".join([os.path.splitext(f)[0] for f in conv["pdf_files"]][:3])
                if len(conv["pdf_files"]) > 3:
                    title += "..."

            conversations.append({
                "id": str(conv["_id"]),
                "title": title,
                "date": conv["created_at"].strftime("%d %b %Y")
            })
        
        return JSONResponse(content={"data": conversations})
    
    except Exception as e:
        raise HTTPException(500, f"Failed to fetch chats: {str(e)}")
    
# Add to graph.py
@router.get("/chat/{conversation_id}")
async def get_chat_details(conversation_id: str):
    try:
        conv = await conversations_collection.find_one({"_id": ObjectId(conversation_id)})
        if not conv:
            raise HTTPException(404, "Conversation not found")

        # Convert datetime objects to ISO strings
        processed_messages = []
        for msg in conv.get("messages", []):
            message = msg.copy()
            if "timestamp" in message:
                message["timestamp"] = message["timestamp"].isoformat()
            processed_messages.append(message)

        return JSONResponse(content={
            "messages": processed_messages,
            "pdf_files": conv.get("pdf_files", []),
            # Include other fields if needed with proper serialization
            "created_at": conv.get("created_at").isoformat() if conv.get("created_at") else None,
            "updated_at": conv.get("updated_at").isoformat() if conv.get("updated_at") else None
        })
    
    except Exception as e:
        raise HTTPException(500, f"Failed to fetch chat: {str(e)}")

@router.get("/knowledge-graph/{conversation_id}", response_class=HTMLResponse)
async def get_knowledge_graph_html(conversation_id: str):
    print(conversation_id)
    try:
        # Fetch the HTML content from MongoDB
        html_document = await knowledge_graph_html_collection.find_one(
            {"conversation_id": conversation_id}
        )
        if not html_document:
            raise HTTPException(status_code=404, detail="Knowledge graph HTML not found")

        # Return the HTML content
        return HTMLResponse(content=html_document["html_content"])

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch knowledge graph HTML: {str(e)}")
