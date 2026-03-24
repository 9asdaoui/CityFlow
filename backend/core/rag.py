import os
from pathlib import Path
from typing import List, Dict, Any, Optional
import torch

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.documents import Document
from langchain_community.chat_message_histories import SQLChatMessageHistory
from sqlalchemy import create_engine

# --- MONKEY PATCH FIX FOR TRANSFORMERS IMPORT BUG ---
import transformers.utils.import_utils
if not hasattr(transformers.utils.import_utils, 'is_torch_npu_available'):
    transformers.utils.import_utils.is_torch_npu_available = lambda: False

# Fix HuggingFace 10s read timeouts on slow connections or large config checks
os.environ["HF_HUB_HTTP_TIMEOUT"] = "120"

from FlagEmbedding import FlagReranker

KNOWLEDGE_BASE_DIR = Path(__file__).parent.parent / "knowledge_base"
CHROMA_PERSIST_DIR = Path(__file__).parent.parent / "chroma_db"
# Keep sqlite safely inside the mounted chroma directory to avoid Docker file-as-directory mount bugs
SQL_MEMORY_URI = f"sqlite:///{CHROMA_PERSIST_DIR / 'memory.db'}"
SQL_MEMORY_ENGINE = create_engine(SQL_MEMORY_URI)

class RagPipeline:
    def __init__(self):
        requested_device = os.getenv("EMBEDDING_DEVICE", "auto").strip().lower()
        if requested_device == "auto":
            embedding_device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            embedding_device = requested_device

        use_fp16_env = os.getenv("RERANKER_USE_FP16", "auto").strip().lower()
        if use_fp16_env == "auto":
            reranker_use_fp16 = embedding_device == "cuda"
        else:
            reranker_use_fp16 = use_fp16_env in {"1", "true", "yes", "on"}

        print(f"[RAG] Embedding device: {embedding_device} | Reranker fp16: {reranker_use_fp16}")

        # Local HuggingFace Embeddings
        self.embeddings = HuggingFaceEmbeddings(
            model_name="BAAI/bge-m3",
            model_kwargs={'device': embedding_device},
            encode_kwargs={'normalize_embeddings': True}
        )
        
        # Local Persistent Vector Store
        self.vector_store = Chroma(
            collection_name="cityflow_rag",
            embedding_function=self.embeddings,
            persist_directory=str(CHROMA_PERSIST_DIR)
        )
        
        # Local Llama3 via Ollama docker
        self.llm = ChatOllama(
            base_url=os.getenv("OLLAMA_HOST", "http://localhost:11434"),
            model="llama3", 
            temperature=0.0
        )
        
        # BGE Reranker
        try:
            self.reranker = FlagReranker('BAAI/bge-reranker-v2-m3', use_fp16=reranker_use_fp16)
        except Exception as e:
            print(f"Reranker init failed (this is expected if weights are missing locally): {e}")
            self.reranker = None

    def ingest_documents(self):
        """Loads PDFs, chunks 800/100, enriches metadata, embeds to ChromaDB."""
        subfolders = ["traffic_regulations", "emergency_protocols", "pollution_regulations", "system_docs"]
        all_chunks = []
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)

        for folder in subfolders:
            folder_path = KNOWLEDGE_BASE_DIR / folder
            if not folder_path.exists():
                os.makedirs(folder_path, exist_ok=True)
                continue
                
            # Iterate through PDFs
            for file_path in folder_path.glob("*.pdf"):
                print(f"Loading {file_path.name}...")
                loader = PyPDFLoader(str(file_path))
                docs = loader.load()
                
                for doc in docs:
                    doc.metadata["source_file"] = file_path.name
                    doc.metadata["category"] = folder
                    doc.metadata["file_type"] = "pdf"
                
                chunks = text_splitter.split_documents(docs)
                all_chunks.extend(chunks)

        if all_chunks:
            self.vector_store.add_documents(all_chunks)
            print(f"Successfully ingested {len(all_chunks)} chunks to ChromaDB.")
        else:
            print("No valid PDFs found to ingest.")
        
    def _generate_search_queries(self, query: str, history: List[Any]) -> List[str]:
        """Runs a SINGLE LLM call to contextualize the query AND generate 3 variations."""
        history_text = "\n".join([f"{msg.type}: {msg.content}" for msg in history[-5:]]) if history else "No history."
        
        prompt = ChatPromptTemplate.from_template(
            "You are an AI search assistant. Given the chat history and new user query, "
            "output exactly 4 standalone search queries (one highly contextualized version of the new query, "
            "plus 3 alternative variations to maximize retrieval). "
            "CRITICAL INSTRUCTIONS:\n"
            "- Output ONLY a numbered list of the 4 queries and nothing else.\n"
            "- ALWAYS use the exact same language as the user's query.\n\n"
            "Chat History:\n{history}\n\n"
            "New User Query: {query}\n\n"
            "Search Queries:"
        )
        chain = prompt | self.llm | StrOutputParser()
        result = chain.invoke({"history": history_text, "query": query})
        
        queries = []
        for line in result.split('\n'):
            line = line.strip()
            if line and line[0].isdigit() and (line[1] == '.' or line[1] == ')'):
                queries.append(line[2:].strip())
            elif line.startswith('- '):
                queries.append(line[2:].strip())
        
        if not queries:
            queries = [query]
            
        return queries[:4]

    def _rerank_and_filter(self, query: str, docs: List[Document]) -> List[Document]:
        """Local Reranking using Cross-Encoder."""
        if not self.reranker or not docs:
            return docs[:5]
            
        pairs = [[query, doc.page_content] for doc in docs]
        scores = self.reranker.compute_score(pairs)
        
        doc_score_pairs = list(zip(docs, scores))
        doc_score_pairs.sort(key=lambda x: x[1], reverse=True)
        
        return [doc for doc, score in doc_score_pairs[:5]]

    def chat(self, user_id: str, query: str) -> Dict[str, Any]:
        """Executes the full RAG pipeline and logs to SQL Memory."""
        memory = SQLChatMessageHistory(session_id=user_id, connection=SQL_MEMORY_ENGINE)
        history = memory.messages
        
        # 1. Batched Generation (1 contextual + 3 variations)
        queries = self._generate_search_queries(query, history)
        standalone_query = queries[0] if queries else query
        
        # 3. Parallel Retrieval & Deduplication (Max 20)
        unique_chunks = {}
        for q in queries:
            results = self.vector_store.similarity_search(q, k=5)
            for doc in results:
                unique_chunks[doc.page_content] = doc
                
        all_retrieved_docs = list(unique_chunks.values())[:20]
        
        # 4. Rerank
        final_docs = self._rerank_and_filter(standalone_query, all_retrieved_docs)
        
        # 5. Generation with Citations
        context_text = "\n\n".join([f"[Source: {d.metadata.get('source_file')}, Category: {d.metadata.get('category')}]\n{d.page_content}" for d in final_docs])
        
        prompt = ChatPromptTemplate.from_template(
            "You are the 'Urban Mobility & Regulation Expert for CityFlow Sentinel'. "
            "Your role is to provide highly precise, operational, and professional answers to city operators.\n\n"
            "CRITICAL INSTRUCTIONS:\n"
            "1. LANGUAGE: ALWAYS respond in the exact same language as the user's query. If the user asks in French, reply ENTIRELY in French.\n"
            "2. TERMINOLOGY: You MUST strictly use the official project terminology for tension levels: **Faible**, **Modéré**, and **Critique**. NEVER use generic terms like low/medium/high.\n"
            "3. FORMATTING: You MUST use Markdown formatting. Use ### headers for sections, use bullet points (-) for lists of impacts or protocols, and **bold** key terms.\n"
            "4. CITATIONS: At the very bottom of your response, you MUST output a horizontal line (---) followed exactly by a '### Sources Consultées' section listing the source_file and category from the provided context.\n\n"
            "Answer the user's question ONLY based on the following context. "
            "If the context does not contain the answer, state clearly that you do not have the information in your current regulatory database.\n\n"
            "Context:\n{context}\n\n"
            "Question: {query}\n\n"
            "Answer:"
        )
        
        chain = prompt | self.llm | StrOutputParser()
        answer = chain.invoke({"context": context_text, "query": standalone_query})
        
        # 6. Update Memory
        memory.add_user_message(query)
        memory.add_ai_message(answer)
        
        return {
            "answer": answer,
            "sources": [doc.metadata for doc in final_docs]
        }

rag_pipeline: Optional[RagPipeline] = None


def get_rag_pipeline() -> RagPipeline:
    global rag_pipeline
    if rag_pipeline is None:
        rag_pipeline = RagPipeline()
    return rag_pipeline
