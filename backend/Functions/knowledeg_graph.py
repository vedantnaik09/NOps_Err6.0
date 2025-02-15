from fastapi import FastAPI, File, UploadFile, Form
from fastapi.responses import JSONResponse
from llama_index.core import SimpleDirectoryReader, KnowledgeGraphIndex
from llama_index.core.graph_stores import SimpleGraphStore
from llama_index.llms.gemini import Gemini
from llama_index.core import Settings
from llama_index.embeddings.gemini import GeminiEmbedding
from llama_index.core import StorageContext
import os
from dotenv import load_dotenv
from pyvis.network import Network
import tempfile

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

# Declare the global index variable
index = None  # Initially, set to None

def process_pdf(pdf_path: str):
    """
    Process a PDF file to generate a knowledge graph and query response.
    """
    global index  # Use the global variable!
    
    documents = SimpleDirectoryReader(pdf_path).load_data()
    graph_store = SimpleGraphStore()
    storage_context = StorageContext.from_defaults(graph_store=graph_store)
    
    # Build the index and update the global variable
    index = KnowledgeGraphIndex.from_documents(
        documents,
        max_triplets_per_chunk=5,
        storage_context=storage_context,
    )
    
    query_engine = index.as_query_engine(
        include_text=False, response_mode="tree_summarize"
    )
    response = query_engine.query("ZeroShot Single Point Valid Mask Evaluation.")
    
    # Generate the knowledge graph visualization
    g = index.get_networkx_graph()
    net = Network(notebook=True, cdn_resources="in_line", directed=True)
    net.from_nx(g)
    html_str = net.generate_html()
    
    return html_str, response

def process_text(text: str):
    global index
    if index is None:
        return "Error: The index has not been initialized. Please upload a PDF first."
    
    query_engine = index.as_query_engine(
        include_text=False, response_mode="tree_summarize"
    )
    response = query_engine.query(text)  # Optionally use the provided text here
    
    return response
