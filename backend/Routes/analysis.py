import base64
import shutil
from fastapi import APIRouter, UploadFile, Form, File
from fastapi.responses import JSONResponse
import os
import tempfile
import subprocess
from pathlib import Path
import google.generativeai as genai
from dotenv import load_dotenv
from io import BytesIO
from PyPDF2 import PdfReader
import matplotlib.pyplot as plt
from Functions.analysis import extract_structured_data,extract_text_from_pdf
# Load environment variables
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel(
    model_name='gemini-2.0-flash-thinking-exp',
    generation_config={"temperature": 0.1}
)

router = APIRouter()

def sanitize_filename(name: str) -> str:
    """Sanitize strings for use in filenames"""
    return "".join([c if c.isalnum() or c in ('_', '-') else '_' for c in name])

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF bytes"""
    text = ""
    with BytesIO(pdf_bytes) as f:
        reader = PdfReader(f)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text
@router.post("/structured_json/")
async def structured_json_route(
    files: list[UploadFile] = File(None),
    text: str = Form(None),
    user_id: str = Form(...),
    conversation_id: str = Form(...)
):
    temp_path = None
    viz_folder = None
    
    try:
        combined_text = ""
        
        # Process PDF files
        if files:
            for file in files:
                contents = await file.read()
                combined_text += extract_text_from_pdf(contents)
                await file.close()
        
        # Add text input
        if text:
            combined_text += text
        
        if not combined_text.strip():
            return JSONResponse(
                status_code=400,
                content={"error": "No valid input provided"}
            )
        
        # Generate structured data
        structured_data = extract_structured_data(combined_text)
        
        # Create visualization folder
        viz_folder = f"viz_{sanitize_filename(user_id)}_{sanitize_filename(conversation_id)}"
        os.makedirs(viz_folder, exist_ok=True)
        
        # Generate visualization code
        prompt = f"""Generate Python code to visualize this data:
        {structured_data}
        Requirements:
        - Use matplotlib
        - Save plots as JPG to '{viz_folder}' folder
        - Include bar charts and pie charts only 5 most relevant plots only.
        - Format: Only raw Python code, no markdown
        - Add plt.close() after each save"""
        
        response = model.generate_content(prompt)
        generated_code = response.text.strip().replace("```python", "").replace("```", "")
        
        # Create temp file
        with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as temp_file:
            temp_file.write(generated_code)
            temp_path = temp_file.name
        
        try:
            # Execute code with timeout
            result = subprocess.run(
                ["python", temp_path],
                capture_output=True,
                text=True,
                timeout=30,
                cwd=os.getcwd()
            )
            
            if result.returncode != 0:
                error_msg = f"Code execution failed:\nSTDOUT: {result.stdout}\nSTDERR: {result.stderr}"
                Path("code_error.log").write_text(f"Code:\n{generated_code}\n\n{error_msg}")
                return JSONResponse(
                    status_code=500,
                    content={"error": error_msg}
                )
            
            # Get generated files and convert to base64
            visualizations = []
            for filename in os.listdir(viz_folder):
                if filename.endswith(('.jpg', '.jpeg', '.png')):
                    file_path = os.path.join(viz_folder, filename)
                    with open(file_path, "rb") as image_file:
                        encoded_string = base64.b64encode(image_file.read()).decode()
                        visualizations.append({
                            "filename": filename,
                            "base64": encoded_string
                        })
            
            response_data = {
                "status": "success",
                "images": visualizations
            }
            
            return JSONResponse(response_data)
            
        except subprocess.TimeoutExpired:
            return JSONResponse(
                status_code=500,
                content={"error": "Code execution timed out (30s)"}
            )
        finally:
            # Clean up temporary Python file
            if temp_path and os.path.exists(temp_path):
                os.unlink(temp_path)
            
            # Clean up visualization folder and its contents
            if viz_folder and os.path.exists(viz_folder):
                shutil.rmtree(viz_folder)
            
    except Exception as e:
        # Ensure cleanup happens even if there's an error
        if temp_path and os.path.exists(temp_path):
            os.unlink(temp_path)
        if viz_folder and os.path.exists(viz_folder):
            shutil.rmtree(viz_folder)
            
        return JSONResponse(
            status_code=500,
            content={"error": f"Server error: {str(e)}"}
        )