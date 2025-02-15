from fastapi import FastAPI, File, UploadFile, Form, APIRouter, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
import tempfile
import os
from Functions.knowledge_graph import process_pdf,process_text
router = APIRouter()

@router.post("/process_pdf/")
async def process_pdf_route(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    conversation_id: Optional[str] = Form(None)
):
    """Process PDF file and store chat in MongoDB"""
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            file_path = os.path.join(temp_dir, file.filename)
            with open(file_path, "wb") as f:
                f.write(file.file.read())
            
            result = await process_pdf(temp_dir, user_id, conversation_id, file.filename)
            return JSONResponse(content=result)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/process_text/")
async def process_text_route(
    text: str = Form(...),
    user_id: str = Form(...),
    conversation_id: Optional[str] = Form(None)
):
    """Process text query and store chat in MongoDB"""
    try:
        result = await process_text(text, user_id, conversation_id)
        return JSONResponse(content=result)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chats/{user_id}")
async def get_user_chats(user_id: str):
    """Get all chats for a user"""
    try:
        chats = await db.chats.find({"user_id": user_id}).sort("updated_at", -1).to_list(length=None)
        return JSONResponse(content={"status": "success", "chats": chats})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/{chat_id}")
async def get_chat(chat_id: str):
    """Get a specific chat by ID"""
    try:
        chat = await db.chats.find_one({"_id": ObjectId(chat_id)})
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        return JSONResponse(content={"status": "success", "chat": chat})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))