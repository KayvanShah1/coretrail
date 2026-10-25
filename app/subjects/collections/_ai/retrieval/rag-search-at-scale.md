---
title: "From source documents to grounded answers"
description: "Trace parsing, indexing, hybrid retrieval, reranking and context assembly across a large corpus."
chapter: retrieval
order: 1
sequence: 601
level: Core
mermaid: true
keywords:
  - From source documents to grounded answers
interview_queries:
  - explain from source documents to grounded answers
---

Retrieval-augmented generation (RAG) gives a language model selected information from external sources at request time. The required fact must survive source ingestion, parsing, chunking, indexing, candidate retrieval, ranking and context construction before generation can use it.

{% include figure.html id="rag-architecture" %}

{% capture rag_architecture %}
flowchart TD
subgraph OFF["Asynchronous indexing"]
S["Versioned source documents"] --> P["Parse and chunk with source spans"]
P --> E["Encode changed content"]
E --> I["Publish lexical and vector index release"]
end
subgraph ON["Online answer request"]
Q["Question plus verified identity"] --> R["Authorized hybrid candidate retrieval"]
R --> K["Fuse ranks and rerank"]
K --> C["Pack evidence, revisions and citations"]
C --> V{"Evidence sufficient?"}
V -- "Yes" --> G["Generate and validate cited answer"]
V -- "No" --> A["Clarify, retrieve again or abstain"]
end
I --> R
{% endcapture %}
{% capture rag_fallback %}
Indexing parses versioned sources, chunks and encodes changed content, then publishes lexical and vector indexes. An online request uses identity-scoped retrieval, fusion, reranking and context assembly. Sufficient evidence supports a cited answer; missing evidence requires clarification, another search or abstention.
{% endcapture %}
{% include diagram.html title="Source preparation and online evidence use" code=rag_architecture fallback=rag_fallback caption=true %}

The pipelines meet at a published index release. Source updates can proceed asynchronously while online queries read a coherent version. Index freshness and request latency therefore need different measurements.

## Source preparation and versioning

Keep document IDs, versions, update timestamps, permission metadata, section offsets, and parser status. Tables inside PDFs, code blocks and prose documents have different structural needs. Blind character chunking can separate a heading from its contents or break a table's meaning. Token limits matter, but chunk size should follow document structure and the queries users ask.

Retrieval freshness depends on index updates and deletion propagation. Source deletes must remove or invalidate old indexed content; an old embedding can be just as dangerous as an out-of-date SQL row.

## Retrieval mechanisms

BM25 scores lexical evidence using term frequency and document frequency, making it useful for exact error messages, codes and rare identifiers. Dense retrieval represents queries and passages as embeddings; cosine similarity or dot product ranks vector closeness according to the chosen embedding model and normalization. Approximate nearest-neighbor search trades exact recall for efficient retrieval.

Hybrid search collects both lexical and dense candidates. Reciprocal rank fusion (RRF) can merge their ranks using a score such as 1 / (k + rank), without assuming BM25 scores and cosine scores have a common numeric scale. A cross-encoder reranker considers the query and candidate passage jointly; it can improve top-k selection but adds compute latency.

## After ranking

Enforce document permissions during retrieval and recheck authorization before exposing evidence. Deduplicate passages, select a context order, respect the token budget and retain citations to precise source spans. Adding more text can dilute good evidence, especially when redundant chunks crowd the context. Generation instructions should distinguish supported facts from missing information and allow abstention when the evidence is inadequate.

## One million documents, 100,000 users

Capacity cannot be inferred from corpus size and registered users alone. Ask how frequently each user queries, average document and chunk sizes, peak concurrent searches, index refresh targets, ACL selectivity, model size and available latency budget.

For an illustrative workload, 100,000 daily active users making five queries each produce 500,000 daily queries. Spread over ten active hours, that averages about 13.9 queries per second. A fourfold peak reaches about 55.6 queries per second. At 180 output tokens per query, the model tier needs roughly 10,000 output tokens per second during that peak, plus prompt-processing capacity.

A four-second mean response time at that arrival rate implies roughly 222 in-flight requests under stable conditions. Queues, streaming, tool calls and token-length variation change the distribution, so benchmark the complete path using representative prompts and outputs. Registered-user count by itself supplies none of these capacity inputs.

Separate ingestion scaling from online query scaling. Measure embedding generation throughput, index storage, search p95, filter selectivity, candidate recall and reranking latency. Add scoped caching, admission controls and backpressure where appropriate, but never share cached restricted passages across unauthorized users.

A query may retrieve the right passage and still fail because context packing drops its exception or year. [Evidence-survival diagnostics]({{ '/ai-engineering/evaluation/evidence-survival-oracle-tests/' | relative_url }}) follows the required facts through each stage. [Incremental indexing]({{ '/ai-engineering/retrieval/document-chunks-incremental-updates/' | relative_url }}) explains how those passages change after a source revision.
