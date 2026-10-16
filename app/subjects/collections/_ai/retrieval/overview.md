---
title: "RAG & retrieval"
nav_title: Overview
description: "Follow document changes, chunking, embeddings, indexing, hybrid ranking and model selection through production retrieval."
chapter: retrieval
order: 0
sequence: 600
level: Chapter overview
---
Retrieval-augmented generation (RAG) depends on several independently versioned components. The relevant facts must survive ingestion, chunking, vector and lexical retrieval, reranking and context selection. Search quality and knowledge freshness deserve separate diagnostics.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/ai-engineering/retrieval/rag-search-at-scale/' | relative_url }}">From source documents to grounded answers</a><span>Follow parsing, hybrid search, ranking, context assembly and large-corpus scaling.</span></li>
<li><a href="{{ '/ai-engineering/retrieval/document-chunks-incremental-updates/' | relative_url }}">Document chunking, revisions and incremental indexing</a><span>Keep source changes, chunk hashes, citations and active revisions consistent.</span></li>
<li><a href="{{ '/ai-engineering/retrieval/vector-search-ranking/' | relative_url }}">Vector indexes, ranking and retrieval metrics</a><span>Compare HNSW, IVF, BM25, reranking, MRR, nDCG and evidence coverage.</span></li>
<li><a href="{{ '/ai-engineering/retrieval/embedding-index-migrations/' | relative_url }}">Embedding versions, index migration and cache invalidation</a><span>Build and publish compatible embedding releases without mixing vector spaces.</span></li>
<li><a href="{{ '/ai-engineering/retrieval/retriever-generator-selection/' | relative_url }}">Choosing embeddings, rerankers and generation models</a><span>Run controlled experiments and compare end-to-end quality, p95 latency and cost.</span></li>
</ul>

Continue into [AI evaluation]({{ '/ai-engineering/evaluation/overview/' | relative_url }}) to locate the point where required evidence disappears.
