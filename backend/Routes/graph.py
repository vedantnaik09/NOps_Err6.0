from fastapi import FastAPI, File, UploadFile, Form, APIRouter
from fastapi.responses import JSONResponse
import tempfile

import os
from Functions.knowledege_graph import process_pdf,process_text
router = APIRouter()

@router.post("/process_pdf/")
async def process_pdf_route(file: UploadFile = File(...)):
    """
    Endpoint to process a PDF file and return the knowledge graph HTML and response.
    """
    with tempfile.TemporaryDirectory() as temp_dir:
        file_path = os.path.join(temp_dir, file.filename)
        with open(file_path, "wb") as f:
            f.write(file.file.read())
        html_str, response = process_pdf(temp_dir)
        return JSONResponse(content={"html": html_str, "response": str(response)})
    
@router.post("/process_text/")
async def process_text_route(text: str = Form(...)):
    """
    Endpoint to process a text input and return the knowledge graph HTML and response.
    """
    response = process_text(text)
    return JSONResponse(content={"response": str(response)})    