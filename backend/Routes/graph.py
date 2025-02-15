from fastapi import FastAPI, File, UploadFile, Form, APIRouter
from fastapi.responses import JSONResponse
import tempfile

import os
from Functions.knowledge_graph import process_pdf,process_text
router = APIRouter()

@router.post("/process_pdf/")
async def process_pdf_route(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    conversation_id: str = Form(...)
):
    """
    Endpoint to process a PDF file and return the knowledge graph HTML.
    It also accepts a user_id and conversation_id to create a unique storage folder.
    """
    with tempfile.TemporaryDirectory() as temp_dir:
        file_path = os.path.join(temp_dir, file.filename)
        with open(file_path, "wb") as f:
            f.write(file.file.read())
        html_str = process_pdf(temp_dir, user_id, conversation_id)
        return JSONResponse(content={"html": html_str})
    
@router.post("/process_text/")
async def process_text_route(
    text: str = Form(...),
    user_id: str = Form(...),
    conversation_id: str = Form(...)
):
    """
    Endpoint to process text input using the knowledge graph index from the specified user/conversation folder.
    """
    response = process_text(text, user_id, conversation_id)
    return JSONResponse(content={"response": str(response)})