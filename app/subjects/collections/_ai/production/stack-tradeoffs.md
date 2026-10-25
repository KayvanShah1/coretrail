---
title: "AI platform tool choices and replacement triggers"
description: "Compare vector search, inference runtimes, agent orchestration and data stores by what each system owns and when its limitations matter."
chapter: production
order: 8
sequence: 408
level: Intermediate
keywords: [FAISS, Elasticsearch, vLLM, LangGraph, Qdrant, pgvector, BigQuery, DuckDB, architecture tradeoffs]
aliases: [AI engineering stack alternatives, tool limitations]
interview_queries: [FAISS vs vector database, when to replace LangGraph, vLLM vs managed inference]
---
Technology selection becomes easier when the failure or operating constraint is explicit. A similarity-search library owns vector search; a search service also owns request handling and index operations. An agent orchestrator manages task transitions, while a graphics processing unit (GPU) inference engine schedules model execution. Assigning these responsibilities exposes what each product still needs around it.

## Retrieval libraries and services

| Technology | Good fit | Cost or limitation | Alternative when conditions change |
|---|---|---|---|
| FAISS | Locally controlled similarity indexes | Application owns persistence, metadata, authorization and service scaling | Qdrant, Milvus, Weaviate, pgvector |
| Elasticsearch | Lexical search, BM25, filters and distributed indexing | Shard/resource tuning and operational complexity | OpenSearch, Vespa, PostgreSQL + pgvector |
| PostgreSQL + pgvector | Relational records and vector search share operational ownership | Index size, filtering and concurrency require workload benchmarks | Dedicated vector service at larger or specialized load |
| BigQuery vector search | Analytical vector search close to warehouse data | Batch/query cost and latency model differ from interactive serving | Vertex AI Vector Search or dedicated search engine |

FAISS is a vector index library; a cache layered over it still needs an explicit key, invalidation rule and authoritative record. Elasticsearch can perform vector retrieval too, making a separate FAISS component unnecessary when a single search engine meets latency and quality requirements. If two indexes remain, align their document IDs, revisions and access filters.

## Serving and orchestration

| Technology | Primary responsibility | What remains to build |
|---|---|---|
| vLLM | Scheduling and efficient autoregressive inference | GPU provisioning, application logic, evaluation, quotas and operational control |
| Managed model endpoint | Provider-operated model infrastructure | Application state, tool safety, prompt/model evaluation and provider risk |
| LangGraph | Explicit state transitions and checkpoints | Authorization, side-effect idempotency and artifact versions |
| Typed Python tool loop | Small controlled agent workflows | Durable state, retries and observability when requirements grow |
| Temporal | Durable general-purpose workflow execution | large language model (LLM) planning and tool semantics |
| Docker | Image/runtime packaging | Scheduling, security controls and monitoring |
| Kubernetes | Workload controllers and node scheduling | Model quality, application correctness and workload-specific autoscaling |

A controlled single-agent workflow may outperform a multi-agent design when the task consists of structured search and validated tool operations. Separate agents earn their coordination cost when domain permissions, parallel ownership or isolation requirements justify them.

## Operational databases and pipelines

An embedded analytical database such as DuckDB suits local or batch SQL analytics. Many concurrent transactional writes from independent applications may call for PostgreSQL or another transactional source of truth. BigQuery excels at analytical scans; individual low-latency row updates and point lookups have different economics.

Apache Beam/Dataflow offers distributed batch and stream processing with event-time windows. Flink provides stateful streaming capabilities, while Spark Structured Streaming is another option when unified Spark batch and streaming ecosystems matter. Every distributed engine still requires late-data policies, replay semantics and operational backpressure.

Dagster emphasizes data assets and materializations; Airflow emphasizes workflow task scheduling and its broader operator ecosystem. An experiment tracker such as MLflow records runs and model artifacts, but feature freshness, online inference and business monitoring require separate systems.

## A replacement decision needs evidence

When a pipeline slows, identify the bottleneck: indexing throughput, filtered search recall, tool retries, inference queue, disk I/O or source freshness. Benchmark candidates on the same input distribution and quality definitions. Count migration, dual-writing and on-call complexity in the total cost.

Use [retrieval ranking]({{ '/ai-engineering/retrieval/vector-search-ranking/' | relative_url }}), [embedding migrations]({{ '/ai-engineering/retrieval/embedding-index-migrations/' | relative_url }}) and [production LLM architecture]({{ '/ai-engineering/production/architecture/' | relative_url }}) for component-specific mechanisms.
