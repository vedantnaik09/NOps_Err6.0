from llama_index.llms.gemini import Gemini
from llama_index.core import Settings
from llama_index.embeddings.gemini import GeminiEmbedding
import json
from fastapi import APIRouter,UploadFile,Form,File
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv
from Functions.analysis import extract_structured_data,extract_text_from_pdf,parse_numerical_value
load_dotenv()

# Load environment variables
load_dotenv()
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

# Initialize LLM and Embedding Model
llm = Gemini(temperature=0, model="models/gemini-2.0-flash")
Settings.llm = llm
Settings.embed_model = GeminiEmbedding(
    model_name="models/embedding-001", api_key=os.getenv("GOOGLE_API_KEY")
)
Settings.chunk_size = 512

router = APIRouter()


# Route to generate structured JSON
@router.post("/structured_json/")
async def structured_json_route(
    files: list[UploadFile] = File(None),  # Accepts a list of files
    text: str = Form(None),  # Optional: Accepts text input
    user_id: str = Form(...),
    conversation_id: str = Form(...)
):
    """
    Endpoint to generate structured JSON from multiple PDFs or text input.
    """
    try:
        combined_text = ""
        if files:
            # Extract text from each PDF
            for file in files:
                combined_text += extract_text_from_pdf(file)

        if text:
            # Append the text input to the combined text
            combined_text += text

        if combined_text:
            # Extract structured JSON from the combined text
            structured_data = extract_structured_data(combined_text)
        else:
            return JSONResponse(
                status_code=400,
                content={"error": "Either files or text input is required."}
            )

        # Return structured JSON
        return JSONResponse(content={"structured_data": structured_data})

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"An error occurred: {str(e)}"}
        )