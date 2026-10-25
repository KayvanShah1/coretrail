---
title: "Query planning, multi-hop retrieval and GraphRAG"
description: "Decide when query rewriting, decomposed searches and graph traversal improve evidence coverage and where they fail."
chapter: retrieval
order: 8
sequence: 608
level: Intermediate
mermaid: true
keywords: [GraphRAG, knowledge graph, multi hop retrieval, query expansion, HyDE, graph traversal, query rewriting]
aliases: [agentic RAG, multi query retrieval]
interview_queries: [when should you use GraphRAG, how does multi-hop retrieval work]
---
A conventional retriever ranks chunks against one query. That works well for a question answered by one self-contained passage. Questions that combine facts across multiple entities and periods can need several searches and an explicit join in reasoning.

Suppose a user asks which equipment providers served projects that were delayed in two different years. One passage records a project delay; another lists the project's provider. Neither passage alone answers the request.

## Decompose the information need

{% capture diagram_code %}
flowchart TD
Q["Question: providers linked to delayed projects"] --> A["Find projects with qualifying delay events"]
Q --> B["Find provider relationships for those projects"]
A --> C["Join on stable project identifiers"]
B --> C
C --> D["Verify date, source and relationship"]
D --> E["Assemble cited evidence / answer"]
D -. "Missing relationship" .-> B
{% endcapture %}
{% capture diagram_fallback %}
Decompose the question into delay-event lookup and project-provider relationship lookup; join on stable IDs, verify dates and provenance, then assemble the answer.
{% endcapture %}
{% include diagram.html title="Multi-hop retrieval joins evidence from two sources" code=diagram_code fallback=diagram_fallback caption=true %}

**Query rewriting** expands aliases or clarifies ambiguous entities, improving search recall if the original words poorly match stored sources. **Multi-query retrieval** searches several distinct formulations, then deduplicates candidates. **HyDE** (Hypothetical Document Embeddings) embeds a model-generated hypothetical answer as a retrieval query; it can increase semantic recall but can also steer search toward plausible yet false assumptions. Evaluate the resulting retrieved evidence, not the hypothetical text's fluency.

## When a graph changes the workload

A knowledge graph represents entities as nodes and relations as edges, often with source references and effective dates. A graph traversal can answer relationship-heavy questions by walking project → contract → supplier → region paths. The graph still needs ingestion, entity resolution, deduplicated IDs and relation freshness.

GraphRAG approaches vary. Some use graph traversal to gather facts; others derive community summaries to answer broad corpus-level questions. These have different index-build costs and different failure modes. An enterprise graph built from large language model (LLM)-extracted relations can propagate entity-merging errors unless edges retain provenance and confidence.

| Workload | Starting approach | When to escalate |
|---|---|---|
| One passage answers question | Hybrid lexical+dense retrieval | Weak lexical recall or complex context |
| Several independent facts | Decomposed or multi-query retrieval | Dependencies and joins become repetitive |
| Connected entity relations | SQL joins or graph traversal | Many hops, ambiguous paths and evolving relationships |
| Broad cross-document themes | Summaries or graph communities | Corpus-level analysis worth index maintenance |

## Evaluation must reward complete evidence

A first relevant result at rank one can produce perfect mean reciprocal rank (MRR) while a necessary second result is missing. Define the relevant evidence set for each multi-hop case, then measure whether **all required hops** survive retrieval, reranking and context packing.

Check join-key collisions, relation timestamps, alias resolution and missing-edge behavior. The answer should abstain when one critical relation remains unverified. Run a baseline without graph traversal first; knowledge graphs add extraction, updates and reconciliation overhead, so their advantage must be measurable.

Continue with [ranking metrics]({{ '/ai-engineering/retrieval/vector-search-ranking/' | relative_url }}) and [oracle stage tests]({{ '/ai-engineering/evaluation/evidence-survival-oracle-tests/' | relative_url }}).
