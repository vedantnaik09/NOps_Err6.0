import os
from typing import List
from llama_index.core import SimpleDirectoryReader, KnowledgeGraphIndex, VectorStoreIndex
from llama_index.core.graph_stores import SimpleGraphStore
from llama_index.llms.gemini import Gemini
from llama_index.core import Settings
from llama_index.embeddings.gemini import GeminiEmbedding
from llama_index.core import StorageContext, load_index_from_storage
from pyvis.network import Network

# Initialize LLM and Embedding Model
llm = Gemini(temperature=0, model="models/gemini-2.0-flash")
Settings.llm = llm
Settings.embed_model = GeminiEmbedding(
    model_name="models/embedding-001", api_key=os.getenv("GOOGLE_API_KEY"),
)
Settings.chunk_size=512
def process_pdfs(pdf_paths: List[str], user_id: str, conversation_id: str) -> dict:
    """Process multiple PDFs to create merged knowledge graph and vector index"""
    persist_dir = os.path.join("./storage", f"{user_id}_{conversation_id}")
    os.makedirs(persist_dir, exist_ok=True)

    # Load and merge documents
    documents = SimpleDirectoryReader(input_files=pdf_paths).load_data()

    # Knowledge Graph for visualization
    graph_storage = StorageContext.from_defaults(graph_store=SimpleGraphStore())
    kg_index = KnowledgeGraphIndex.from_documents(
        documents,
        max_triplets_per_chunk=2,
        storage_context=graph_storage,
    )
    
    # Generate visualization
    net = Network(notebook=True, cdn_resources="in_line", directed=True)
    net.from_nx(kg_index.get_networkx_graph())
    html_str = net.generate_html()

    # Vector Index for RAG
    vector_storage = StorageContext.from_defaults()
    VectorStoreIndex.from_documents(documents, storage_context=vector_storage)
    vector_storage.persist(persist_dir)
    
    # Instead of just returning html_str, return a structured response
    return {
        "status": "success",
        "message": f"Successfully processed {len(pdf_paths)} PDF(s). You can now ask questions about their content.",
        "html": html_str  # This will be stored but not displayed
    }

def process_text(query: str, user_id: str, conversation_id: str) -> str:
    """Query the merged RAG index"""
    persist_dir = os.path.join("./storage", f"{user_id}_{conversation_id}")
    if not os.path.exists(persist_dir):
        return "Error: No processed documents found"

    storage_context = StorageContext.from_defaults(persist_dir=persist_dir)
    index = load_index_from_storage(storage_context)
    return str(index.as_query_engine().query(query))