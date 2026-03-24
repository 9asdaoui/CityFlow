import importlib

from langchain_core.documents import Document
from langchain_core.runnables import RunnableLambda


class FakeVectorStore:
    def __init__(self, docs):
        self.docs = docs

    def similarity_search(self, query, k=5):
        return self.docs.get(query, [])


class FakeReranker:
    def __init__(self):
        self.pair_count = 0

    def compute_score(self, pairs):
        self.pair_count = len(pairs)
        return [float(i) for i in range(len(pairs))]


def test_chat_deduplicates_to_20_and_returns_5_ranked(monkeypatch, tmp_path):
    rag_module = importlib.import_module("backend.core.rag")

    pipeline = rag_module.RagPipeline.__new__(rag_module.RagPipeline)
    fake_reranker = FakeReranker()

    docs = [
        Document(page_content=f"chunk-{i}", metadata={"source_file": f"doc-{i}.pdf", "category": "system_docs"})
        for i in range(30)
    ]

    pipeline.vector_store = FakeVectorStore(
        {
            "q1": docs[0:8],
            "q2": docs[5:13],
            "q3": docs[10:18],
            "q4": docs[15:30],
        }
    )
    pipeline.reranker = fake_reranker
    pipeline.llm = RunnableLambda(lambda _: "Mock Ollama answer")

    monkeypatch.setattr(pipeline, "_generate_search_queries", lambda q, h: ["q1", "q2", "q3", "q4"])
    monkeypatch.setattr(rag_module, "SQL_MEMORY_URI", f"sqlite:///{tmp_path / 'rag-memory.db'}")

    result = rag_module.RagPipeline.chat(pipeline, user_id="rag-user", query="test query")

    assert result["answer"] == "Mock Ollama answer"
    assert len(result["sources"]) == 5
    assert fake_reranker.pair_count == 20
