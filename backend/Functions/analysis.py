from llama_index.llms.gemini import Gemini
from llama_index.core import Settings
from llama_index.embeddings.gemini import GeminiEmbedding
import json
import fitz
from fastapi import APIRouter
import os
from dotenv import load_dotenv
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
llm = Gemini(temperature=0, model="models/gemini-2.0-flash")
# Function to extract text from PDF
def extract_text_from_pdf(pdf_file):
    """
    Extract text from a PDF file using PyMuPDF.
    """
    # Read the file content synchronously
    file_content = pdf_file.file.read()
    doc = fitz.open(stream=file_content, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def parse_numerical_value(value):
    """
    Convert a string like "3.9 trillion" or "1.5 million" into its numerical equivalent.
    If the value is already a number, return it as an integer.
    """
    if isinstance(value, (int, float)):
        return int(value)  # Convert to integer if it's already a number

    # Remove commas and spaces
    value = value.replace(",", "").strip()

    # Define multipliers for units
    multipliers = {
        "trillion": 1e12,
        "billion": 1e9,
        "million": 1e6,
        "thousand": 1e3,
    }

    # Check if the value contains a unit
    for unit, multiplier in multipliers.items():
        if unit in value:
            number_part = value.replace(unit, "").strip()
            try:
                return int(float(number_part) * multiplier)
            except ValueError:
                return None  # Return None if parsing fails

    # If no unit is found, try to convert directly
    try:
        return int(float(value))  # Convert to float first to handle decimals
    except ValueError:
        return None  # Return None if parsing fails


# Function to extract structured JSON using LLM
def extract_structured_data(text):
    """
    Extract structured data (entities and relationships) from text using LLM.
    """
    prompt = f"""
    Extract structured data from the following text in JSON format. Focus on financial metrics such as revenues, expenses, assets, liabilities, profits, and any other relevant financial data.
    Return **only valid JSON** with the following structure:
    {{
        "financial_metrics": [
            {{
                "entity": "entity_name",
                "value": "numerical_value",
                "type": "metric_type"  // e.g., "revenue", "expense", "asset", "liability", "profit", etc.
            }}
        ]
    }}

    Do not include any additional text or explanations. Only return valid JSON.

    Text: {text}
    """
    response = llm.complete(prompt)  # Use `complete` instead of `invoke`

    # Clean the response to extract valid JSON
    cleaned_response = response.text.strip()
    if cleaned_response.startswith("```json"):
        cleaned_response = cleaned_response[7:-3].strip()  # Remove ```json and ```
    elif cleaned_response.startswith("```"):
        cleaned_response = cleaned_response[3:-3].strip()  # Remove ``` and ```

    try:
        structured_data = json.loads(cleaned_response)
        # Convert values to integers using the helper function
        for item in structured_data.get("financial_metrics", []):
            parsed_value = parse_numerical_value(item["value"])
            if parsed_value is not None:
                item["value"] = parsed_value
            else:
                item["value"] = 0  # Default to 0 if parsing fails
        return structured_data
    except json.JSONDecodeError:
        return {"financial_metrics": []}  # Return an empty structure
