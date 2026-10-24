---
title: "From source documents to grounded answers"
description: "Trace parsing, indexing, hybrid retrieval, reranking and context assembly across a large corpus."
chapter: retrieval
order: 1
sequence: 601
level: Core
keywords:
  - From source documents to grounded answers
interview_queries:
  - explain from source documents to grounded answers
---

Retrieval-augmented generation (RAG) gives a language model selected information from external sources at request time. The required fact must survive source ingestion, parsing, chunking, indexing, candidate retrieval, ranking and context construction before generation can use it.

## Source preparation and versioning

Keep document IDs, versions, update timestamps, permission metadata, section offsets, and parser status. Tables inside PDFs, code blocks and prose documents have different structural needs. Blind character chunking can separate a heading from its contents or break a table's meaning. Token limits matter, but chunk size should follow document structure and the queries users ask.

Retrieval freshness depends on index updates and deletion propagation. Source deletes must remove or invalidate old indexed content; an old embedding can be just as dangerous as an out-of-date SQL row.

## Retrieval mechanisms

BM25 scores lexical evidence using term frequency and document frequency, making it useful for exact error messages, codes and rare identifiers. Dense retrieval represents queries and passages as embeddings; cosine similarity or dot product ranks vector closeness according to the chosen embedding model and normalization. Approximate nearest-neighbor search trades exact recall for efficient retrieval.

Hybrid search collects both lexical and dense candidates. Reciprocal rank fusion (RRF) can merge their ranks using a score such as 1 / (k + rank), without assuming BM25 scores and cosine scores have a common numeric scale. A cross-encoder reranker considers the query and candidate passage jointly; it can improve top-k selection but adds compute latency.

## After ranking

Deduplicate passages, enforce document-level permissions, select a useful context order, respect the token budget, and retain citations to precise source spans. Adding more text can dilute good evidence, especially when redundant chunks crowd the context. Generation instructions should distinguish supported facts from missing information and allow abstention when the evidence is inadequate.

## One million documents, 100,000 users

Capacity cannot be inferred from corpus size and registered users alone. Ask how frequently each user queries, average document and chunk sizes, peak concurrent searches, index refresh targets, ACL selectivity, model size and available latency budget.

Separate ingestion scaling from online query scaling. Measure embedding generation throughput, index storage, search p95, filter selectivity, candidate recall and reranking latency. Add scoped caching, admission controls and backpressure where appropriate, but never share cached restricted passages across unauthorized users.

The useful debugging question is: **at which stage did the relevant fact stop appearing in the material that reached the model?**
