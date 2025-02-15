import os
from dotenv import load_dotenv
from llama_index.core import SimpleDirectoryReader, KnowledgeGraphIndex
from llama_index.core.graph_stores import SimpleGraphStore
from llama_index.llms.gemini import Gemini
from llama_index.core import Settings
from llama_index.embeddings.gemini import GeminiEmbedding
from llama_index.core import StorageContext, load_index_from_storage
from pyvis.network import Network

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

def process_pdf(pdf_path: str, user_id: str, conversation_id: str):
    """
    Process a PDF file to generate a knowledge graph and persist the index 
    in a unique folder based on user_id and conversation_id.
    """
    # Create a unique folder for this user and conversation
    persist_dir = os.path.join("./storage", f"{user_id}_{conversation_id}")
    os.makedirs(persist_dir, exist_ok=True)

    # Load documents from the provided PDF path
    documents = SimpleDirectoryReader(pdf_path).load_data()
    graph_store = SimpleGraphStore()
    storage_context = StorageContext.from_defaults(graph_store=graph_store)

    # Build the index from documents and persist it to the unique folder
    index = KnowledgeGraphIndex.from_documents(
        documents,
        max_triplets_per_chunk=1,
        storage_context=storage_context,
    )
    index.storage_context.persist(persist_dir=persist_dir)

    # Generate a network visualization of the knowledge graph
    g = index.get_networkx_graph()
    net = Network(notebook=True, cdn_resources="in_line", directed=True)
    net.from_nx(g)
    html_str = net.generate_html()

    return html_str

def load_index_from_storage_1(user_id: str, conversation_id: str):
    """
    Load the index from local storage for the given user and conversation.
    """
    persist_dir = os.path.join("./storage", f"{user_id}_{conversation_id}")
    storage_context = StorageContext.from_defaults(persist_dir=persist_dir)
    index = load_index_from_storage(storage_context=storage_context)
    return index

def process_text(text: str, user_id: str, conversation_id: str):
    """
    Query the knowledge graph index loaded from the user/conversation-specific folder.
    """
    index = load_index_from_storage_1(user_id, conversation_id)
    if index is None:
        return "Error: The index has not been initialized. Please upload a PDF first."
    print(index)
    query_engine = index.as_query_engine(
        include_text=False, response_mode="tree_summarize"
    )
    response = query_engine.query(text)
    #python -m uvicorn main:app --reload
    return response
