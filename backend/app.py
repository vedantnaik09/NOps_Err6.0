import streamlit as st
import fitz  # PyMuPDF
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
import json
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()
groq_api_key = os.environ['GROQ_API_KEY']
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

# Load LLM model (Groq or Gemini)
# llm = ChatGoogleGenerativeAI(model="gemini-pro")
llm = ChatGroq(groq_api_key=groq_api_key, model_name="llama3-70b-8192")

# Function to extract text from PDF
def extract_text_from_pdf(pdf_file):
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

# Function to extract structured JSON using LLM
def extract_structured_data(text):
    prompt = f"""
    Extract structured data from the following text in JSON format. Focus on financial metrics and relationships like "month vs sales" or similar.
    Return *only valid JSON* with the following structure:
    {{
        "amounts": [
            {{
                "entity": "entity_name",
                "value": "numerical_value"
            }}
        ],
        "revenues": [
            {{
                "entity": "entity_name",
                "value": "numerical_value"
            }}
        ]
    }}

    Do not include any additional text or explanations. Only return valid JSON.

    Text: {text}
    """
    response = llm.invoke(prompt)
    st.write("### LLM Response (Raw)")
    st.text(response.content)  # Print the raw response for debugging

    # Clean the response to extract valid JSON
    cleaned_response = response.content.strip()
    if cleaned_response.startswith("json"):
        cleaned_response = cleaned_response[7:-3].strip()  # Remove json and 
    elif cleaned_response.startswith(""):
        cleaned_response = cleaned_response[3:-3].strip()  # Remove  and 

    try:
        structured_data = json.loads(cleaned_response)
        return structured_data
    except json.JSONDecodeError:
        st.error("Failed to parse LLM response into JSON. Using default data.")
        return {"amounts": [], "revenues": []}  # Return an empty structure

# Streamlit app
st.title("PDF to Structured JSON")

# Upload PDF
uploaded_pdf = st.file_uploader("Upload a PDF file", type=["pdf"])

if uploaded_pdf:
    # Extract text from PDF
    text = extract_text_from_pdf(uploaded_pdf)
    st.write("### Extracted Text")
    st.text(text)

    # Extract structured JSON
    structured_data = extract_structured_data(text)
    if structured_data:
        st.write("### Structured JSON Data")
        st.json(structured_data)

        # Display amounts in a table
        if "amounts" in structured_data:
            st.write("### Amounts Table")
            st.table(structured_data["amounts"])

        # Display revenues in a table
        if "revenues" in structured_data:
            st.write("### Revenues Table")
            st.table(structured_data["revenues"])