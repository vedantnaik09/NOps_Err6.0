import streamlit as st
import fitz  # PyMuPDF
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
import json
from dotenv import load_dotenv
import os
import pymongo
from datetime import datetime
import re

# Load environment variables
load_dotenv()
groq_api_key = os.environ['GROQ_API_KEY']
os.environ["GOOGLE_API_KEY"] = os.getenv("GOOGLE_API_KEY")
mongo_uri = os.getenv("MONGO_URI")
database_name = os.getenv("DATABASE_NAME")

# Load LLM model (Groq)
llm = ChatGroq(groq_api_key=groq_api_key, model_name="llama3-70b-8192")

# Function to extract text from PDF
def extract_text_from_pdf(pdf_file):
    doc = fitz.open(stream=pdf_file.read(), filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

# Function to extract company name from text
def extract_company_name(text):
    # Try to find company name in the first few lines
    first_paragraph = text.split('\n\n')[0] if '\n\n' in text else text.split('\n')[0]
    
    # Look for patterns like "Company Name Financial Report" or "Company Name & Co."
    company_patterns = [
        r"^(.*?)\s+Financial Report",
        r"^(.*?)\s+Annual Report",
        r"^(.*?)\s+&\s+Co\.?",
        r"^(.*?)\s+Inc\.?",
        r"^(.*?)\s+Corp\.?",
        r"^(.*?)\s+Corporation",
        r"^(.*?)\s+Ltd\.?"
    ]
    
    for pattern in company_patterns:
        match = re.search(pattern, first_paragraph, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    
    # If we couldn't find a match, use a simpler approach - just take the first line
    # that might look like a company name (not too long, no punctuation)
    lines = text.split('\n')
    for line in lines[:5]:  # Check first 5 lines
        line = line.strip()
        if 2 < len(line) < 50 and not any(p in line for p in ['.', ':', ';', '/', '\\']):
            return line
    
    return "Unknown Company"  # Default if we can't extract the name

# Function to extract structured JSON using LLM
def extract_structured_data(text, company_name):
    prompt = f"""
    Extract structured financial data from the text below in a very specific JSON format.

    IMPORTANT FORMATTING RULES:
    - Use proper JSON syntax with commas between all key-value pairs
    - Ensure closing braces have commas when followed by another category
    - Numbers should NOT have quotes or suffixes like "billion"
        
    The JSON must have these six main categories:
    1. company_name: "{company_name}"
    2. Financial (from Financial Highlights section)
    3. Income (from Income Statement section)
    4. Balance (from Balance Sheet section)
    5. Cash (from Cash Flow Statement section)
    6. Segment (from Segment Performance section)
    
    For each financial category, extract all key-value pairs where values are numeric amounts.
    Convert all values to integers by removing "billion", "million", etc. and multiplying appropriately.
    - If value has "billion", multiply by 1,000,000,000
    - If value has "million", multiply by 1,000,000
    - Remove $ signs and commas
    
    Return ONLY valid JSON with this structure:
    {{
        "company_name": "{company_name}",
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
        # Ensure company_name is in the data
        if "company_name" not in structured_data:
            structured_data["company_name"] = company_name
        return structured_data
    except json.JSONDecodeError as e:
        st.error(f"Failed to parse LLM response into JSON: {e}")
        
        # Attempt to fix common JSON issues
        try:
            import re
            # Replace single quotes with double quotes
            fixed_response = re.sub(r"'([^']*)':", r'"\1":', cleaned_response)
        
            # Add missing commas between numeric values and next property
            fixed_response = re.sub(r'(\d+)\s*\n\s*"', r'\1,\n"', fixed_response)
        
            # Add missing commas between closing braces and next category
            fixed_response = re.sub(r'}\s*\n\s*"(company_name|Financial|Income|Balance|Cash|Segment)":', r'},\n"\1":', fixed_response)
        
            # Ensure proper colon spacing
            fixed_response = re.sub(r'"\s*:\s*', '": ', fixed_response)
            
            st.write("### Attempting to fix JSON")
            st.text(fixed_response)
            
            structured_data = json.loads(fixed_response)
            st.success("Fixed JSON successfully!")
            
            # Ensure company_name is in the data
            if "company_name" not in structured_data:
                structured_data["company_name"] = company_name
                
            return structured_data
        except Exception as e:
            st.error(f"Could not fix JSON format: {e}")
            
        # If we can't fix it, use a simple fallback structure
        st.warning("Using default empty structure")
        return {
            "company_name": company_name,
            "Financial": {},
            "Income": {},
            "Balance": {},
            "Cash": {},
            "Segment": {}
        }

# Function to save data to MongoDB
def save_to_mongodb(data):
    try:
        # Log connection attempt
        st.info(f"Attempting to connect to MongoDB at {mongo_uri[:10]}...")
        
        # Create client with timeout
        client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        
        # Test connection
        client.server_info()  # Will raise exception if connection fails
        
        db = client[database_name]
        collection = db["financial_reports"]
        
        # Add timestamp for tracking
        data["timestamp"] = datetime.now().isoformat()
        
        # Log insertion attempt
        st.info(f"Attempting to insert document into {database_name}.financial_reports...")
        
        result = collection.insert_one(data)
        st.success(f"Document inserted with ID: {result.inserted_id}")
        return result.inserted_id
    
    except pymongo.errors.ServerSelectionTimeoutError:
        st.error("Failed to connect to MongoDB server. Check your connection string and network.")
        return None
    except pymongo.errors.OperationFailure as e:
        st.error(f"Authentication failed or operation not permitted: {e}")
        return None
    except Exception as e:
        st.error(f"Error saving to MongoDB: {e}")
        st.error(f"Error type: {type(e).__name__}")
        import traceback
        st.error(traceback.format_exc())
        return None
    finally:
        if 'client' in locals():
            client.close()

# Streamlit app
st.title("Financial PDF to MongoDB JSON Converter")
if st.sidebar.button("Test MongoDB Connection"):
    try:
        client = pymongo.MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        client.server_info()
        db = client[database_name]
        test_result = db.test_collection.insert_one({"test": "connection", "timestamp": datetime.now().isoformat()})
        st.sidebar.success(f"Test successful! Inserted document with ID: {test_result.inserted_id}")
        client.close()
    except Exception as e:
        st.sidebar.error(f"Connection test failed: {e}")
        
# Upload PDF
uploaded_pdf = st.file_uploader("Upload a Financial PDF file", type=["pdf"])

if uploaded_pdf:
    # Extract text from PDF
    text = extract_text_from_pdf(uploaded_pdf)
    
    # Extract company name
    company_name = extract_company_name(text)
    st.write(f"### Detected Company: {company_name}")
    
    # Allow user to edit the company name
    company_name = st.text_input("Company Name", value=company_name)
    
    with st.expander("View Extracted Text"):
        st.text(text)
    
    # Extract structured JSON
    if st.button("Process PDF and Generate JSON"):
        with st.spinner("Processing with LLM..."):
            structured_data = extract_structured_data(text, company_name)
        
        if structured_data:
            st.write("### Generated JSON Structure")
            st.json(structured_data)
            
            # Display each category in a table
            for category in ["company_name", "Financial", "Income", "Balance", "Cash", "Segment"]:
                if category in structured_data:
                    if category == "company_name":
                        st.write(f"### Company: {structured_data[category]}")
                    else:
                        st.write(f"### {category} Data")
                        
                        # Convert dictionary to a format suitable for st.table
                        if isinstance(structured_data[category], dict):
                            table_data = [{"Key": k, "Value": v} for k, v in structured_data[category].items()]
                            st.table(table_data)
            
            # Option to save to MongoDB
            if st.button("Save to MongoDB"):
                with st.spinner("Saving to database..."):
                    inserted_id = save_to_mongodb(structured_data)
                
                if inserted_id:
                    st.success(f"Successfully saved to MongoDB with ID: {inserted_id}")
                    
                    # Display MongoDB query to retrieve this data
                    mongo_query = f"""
                    # Python code to retrieve this document
                    from pymongo import MongoClient
                    
                    client = MongoClient(os.getenv("MONGO_URI"))
                    db = client[os.getenv("DATABASE_NAME")]
                    
                    # Query by ObjectId
                    from bson.objectid import ObjectId
                    doc = db.financial_reports.find_one({{"_id": ObjectId("{inserted_id}")}})
                    
                    # Or query by company name
                    # doc = db.financial_reports.find_one({{"company_name": "{structured_data["company_name"]}"}})
                    
                    # Or query by timestamp
                    # doc = db.financial_reports.find_one({{"timestamp": "{structured_data["timestamp"]}"}})
                    """
                    
                    st.code(mongo_query, language="python")