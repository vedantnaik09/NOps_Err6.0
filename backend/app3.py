import streamlit as st
import fitz  # PyMuPDF
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
import json
from dotenv import load_dotenv
import os
import asyncio
from datetime import datetime
import sys

# Load environment variables
load_dotenv()
groq_api_key = os.environ['GROQ_API_KEY']
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")

# Import from database.py
from database import conversations_collection, client, DB_NAME

# Load LLM model (Groq)
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
    Extract structured financial data from the text below in a very specific JSON format.
    
    The JSON must have these five main categories:
    1. Financial (from Financial Highlights section)
    2. Income (from Income Statement section)
    3. Balance (from Balance Sheet section)
    4. Cash (from Cash Flow Statement section)
    5. Segment (from Segment Performance section)
    
    For each category, extract all key-value pairs where values are numeric amounts.
    Convert all values to integers by removing "billion", "million", etc. and multiplying appropriately.
    - If value has "billion", multiply by 1,000,000,000
    - If value has "million", multiply by 1,000,000
    - Remove $ signs and commas
    
    Return ONLY valid JSON with this structure:
    {{
        "Financial": {{
            "key1": integer_value1,
            "key2": integer_value2,
            ...
        }},
        "Income": {{
            "key1": integer_value1,
            "key2": integer_value2,
            ...
        }},
        "Balance": {{
            "key1": integer_value1,
            "key2": integer_value2,
            ...
        }},
        "Cash": {{
            "key1": integer_value1,
            "key2": integer_value2,
            ...
        }},
        "Segment": {{
            "key1": integer_value1,
            "key2": integer_value2,
            ...
        }}
    }}
    
    Do not include any explanations, markdown formatting, or text outside the JSON.
    Ensure all values are integers, not strings.
    
    Text: {text}
    """
    
    response = llm.invoke(prompt)
    
    # Display raw response for debugging
    st.write("### Raw LLM Response")
    st.text(response.content)
    
    # Clean the response to extract valid JSON
    cleaned_response = response.content.strip()
    
    # Try different patterns to extract JSON
    if cleaned_response.startswith("```json"):
        cleaned_response = cleaned_response[7:].strip()
        if cleaned_response.endswith("```"):
            cleaned_response = cleaned_response[:-3].strip()
    elif cleaned_response.startswith("```"):
        cleaned_response = cleaned_response[3:].strip()
        if cleaned_response.endswith("```"):
            cleaned_response = cleaned_response[:-3].strip()
    
    # Additional attempt to find JSON within the text using regex
    if not cleaned_response or cleaned_response[0] != '{':
        import re
        json_match = re.search(r'(\{.*\})', cleaned_response, re.DOTALL)
        if json_match:
            cleaned_response = json_match.group(1)
    
    st.write("### Cleaned Response for JSON Parsing")
    st.text(cleaned_response)
    
    if not cleaned_response:
        st.error("Empty response after cleaning")
        return None
    
    try:
        structured_data = json.loads(cleaned_response)
        return structured_data
    except json.JSONDecodeError as e:
        st.error(f"Failed to parse LLM response into JSON: {e}")
        
        # Attempt to fix common JSON issues
        try:
            import re
            # Replace single quotes with double quotes
            fixed_response = re.sub(r"'([^']*)':", r'"\1":', cleaned_response)
            # Ensure all values are properly quoted or numeric
            fixed_response = re.sub(r':\s*([a-zA-Z][^,\n}]*)', r': "\1"', fixed_response)
            
            st.write("### Attempting to fix JSON")
            st.text(fixed_response)
            
            structured_data = json.loads(fixed_response)
            st.success("Fixed JSON successfully!")
            return structured_data
        except:
            st.error("Could not fix JSON format")
            
        # If we can't fix it, use a simple fallback structure
        st.warning("Using default empty structure")
        return {
            "Financial": {},
            "Income": {},
            "Balance": {},
            "Cash": {},
            "Segment": {}
        }
# Async function to save data to MongoDB using motor
async def save_to_mongodb_async(data):
    try:
        # Add metadata
        data["type"] = "financial_report"
        data["timestamp"] = datetime.now().isoformat()
        data["source"] = "pdf_extraction"
        
        # Insert the document
        result = await conversations_collection.insert_one(data)
        return result.inserted_id
    except Exception as e:
        st.error(f"Error saving to MongoDB: {e}")
        st.error(f"Error type: {type(e).__name__}")
        import traceback
        st.error(traceback.format_exc())
        return None

# Function to run async function in Streamlit
def save_to_mongodb(data):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(save_to_mongodb_async(data))
    finally:
        loop.close()

# Debug database connection
def debug_db_connection():
    info = []
    
    # Check if we have the URI
    mongo_uri = os.getenv("MONGO_URI")
    if not mongo_uri:
        info.append(("warning", "MONGO_URI environment variable is not set or empty!"))
    
    # Show connection info (safely)
    if mongo_uri:
        uri_parts = mongo_uri.split('@')
        if len(uri_parts) > 1:
            masked_uri = f"mongodb://*****@{uri_parts[1]}"
        else:
            masked_uri = "mongodb://*****"
        info.append(("info", f"Using MongoDB URI: {masked_uri}"))
    
    info.append(("info", f"Using database: {DB_NAME}"))
    info.append(("info", f"Using collection: {conversations_collection.name}"))
    
    return info

# Streamlit app
st.title("Financial PDF to MongoDB JSON Converter")

# Debug database connection in sidebar
with st.sidebar:
    st.header("Database Connection Info")
    for level, message in debug_db_connection():
        if level == "warning":
            st.warning(message)
        else:
            st.info(message)
    
    # Test connection button
    if st.button("Test MongoDB Connection"):
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            test_doc = {"test": "connection", "timestamp": datetime.now().isoformat()}
            
            async def test_insert():
                result = await conversations_collection.insert_one(test_doc)
                await conversations_collection.delete_one({"_id": result.inserted_id})
                return result.inserted_id
            
            test_id = loop.run_until_complete(test_insert())
            loop.close()
            
            st.success(f"Test successful! Inserted and deleted test document with ID: {test_id}")
        except Exception as e:
            st.error(f"Connection test failed: {e}")

# Upload PDF
uploaded_pdf = st.file_uploader("Upload a Financial PDF file", type=["pdf"])

if uploaded_pdf:
    # Extract text from PDF
    text = extract_text_from_pdf(uploaded_pdf)
    
    with st.expander("View Extracted Text"):
        st.text(text)
    
    # Extract structured JSON
    if st.button("Process PDF and Generate JSON"):
        with st.spinner("Processing with LLM..."):
            structured_data = extract_structured_data(text)
        
        if structured_data:
            st.write("### Generated JSON Structure")
            st.json(structured_data)
            
            # Display each category in a table
            for category in ["Financial", "Income", "Balance", "Cash", "Segment"]:
                if category in structured_data:
                    st.write(f"### {category} Data")
                    
                    # Convert dictionary to a format suitable for st.table
                    table_data = [{"Key": k, "Value": v} for k, v in structured_data[category].items()]
                    st.table(table_data)
            
            # Check document size before saving
            estimated_size = sys.getsizeof(json.dumps(structured_data))
            if estimated_size > 16000000:  # MongoDB's document size limit is 16MB
                st.warning(f"Document might be too large for MongoDB (estimated size: {estimated_size / 1000000:.2f}MB)")
            
            # Option to save to MongoDB
            if st.button("Save to MongoDB"):
                with st.spinner("Saving to database..."):
                    inserted_id = save_to_mongodb(structured_data)
                
                if inserted_id:
                    st.success(f"Successfully saved to MongoDB with ID: {inserted_id}")
                    
                    # Display MongoDB query to retrieve this data
                    mongo_query = f"""
                    # Python code to retrieve this document
                    from motor.motor_asyncio import AsyncIOMotorClient
                    import os
                    from dotenv import load_dotenv
                    
                    load_dotenv()
                    MONGO_URI = os.getenv("MONGO_URI")
                    client = AsyncIOMotorClient(MONGO_URI)
                    db = client["chat_db"]
                    
                    async def get_document():
                        # Query by ObjectId
                        from bson.objectid import ObjectId
                        doc = await db.conversations.find_one({{"_id": ObjectId("{inserted_id}")}})
                        
                        # Or query by timestamp
                        # doc = await db.conversations.find_one({{"timestamp": "{structured_data["timestamp"]}"}})
                        return doc
                    """
                    
                    st.code(mongo_query, language="python")