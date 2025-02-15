from fastapi import APIRouter, UploadFile, Form, File
from typing import List
import PyPDF2
from Functions.anomaly import detect

router = APIRouter()

@router.post("/anomaly-processing")
async def process_pdfs_for_anomaly(
    files: List[UploadFile] = File(...),
    user_id: str = Form(...),
    conversation_id: str = Form(...)
):
    extracted_texts = []  # List to store extracted text

    for file in files:
        pdf_reader = PyPDF2.PdfReader(file.file)  # Open the PDF file
        text = "\n".join([page.extract_text() for page in pdf_reader.pages if page.extract_text()])  # Extract text from each page
        extracted_texts.append(text)  # Append extracted text to list
    res=detect(extracted_texts)

    return {"user_id": user_id, "conversation_id": conversation_id, "anamoly":res }
