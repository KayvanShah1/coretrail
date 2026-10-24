---
title: "Embedding versions, index migration and cache invalidation"
description: "Treat model, tokenizer, text preparation and index release as versioned dependencies when replacing search representations."
chapter: retrieval
order: 4
sequence: 604
level: Intermediate
mermaid: true
keywords: [embedding version, embedding space, blue green index, vector migration, index alias, cache invalidation]
aliases: [re-embedding, embedding model upgrade, dual index]
interview_queries: [can two embedding models share vectors, how to migrate embedding model without downtime]
references:
  - title: Weaviate collection aliases
    url: https://docs.weaviate.io/weaviate/manage-collections/collection-aliases
---
The coordinates produced by an embedding encoder only have meaning relative to its learned representation space. A new model may emit exactly the same number of dimensions while arranging related texts differently. Comparing a query encoded by one independently trained model against documents encoded by another generally produces meaningless scores.

Retrieval models may deliberately use different query and document encoders. They work together when trained as a compatible pair. Providers may also prescribe distinct query and document task modes; preserve the prescribed mode in the embedding configuration.

## Version the entire vector input

A meaningful embedding release identifies the model revision, output dimensionality, tokenizer or input formatting, normalization, distance metric, passage preparation, chunker and expected query/document modes. A model identifier alone cannot reproduce how a vector was created.

```yaml
embedding_release: retrieval-v3
model_revision: encoder-revision-17
dimension: 1024
query_mode: retrieval_query
document_mode: retrieval_document
normalize: true
metric: cosine
parser_release: parse-v2
chunker_release: sections-v4
collection_release: knowledge-index-v9
```

Changing only the generation language model ordinarily leaves document embeddings intact, since the generator receives retrieved text. Changing passage text, embedding preprocessing or encoder space requires recomputing affected embeddings. Changing only a search-time HNSW parameter may require no vector update, while changing index-building configuration can require an index rebuild.

## Migration with two indexes

{% capture diagram_code %}
flowchart TD
A["Versioned source snapshot"] --> B["Current embeddings and index"]
A --> C["Candidate embeddings and index"]
B --> D["Paired retrieval evaluation"]
C --> D
D --> E{"Quality and latency gates pass?"}
E -- "No" --> R["Retain current index; revise candidate"]
E -- "Yes" --> F["Shadow queries and synchronize live updates"]
F --> G["Switch active alias to candidate release"]
G --> H["Monitor production and retain rollback"]
{% endcapture %}
{% capture diagram_fallback %}
Snapshot corpus → build current and candidate indexes → compare with the same queries → synchronize changes → shadow traffic → route switch → monitor and retain prior version for rollback.
{% endcapture %}
{% include diagram.html title="Versioned embedding-index migration" code=diagram_code fallback=diagram_fallback caption=true %}

A fair comparison fixes document coverage, source revision, filters and labeled queries. Run both paths in shadow before switching the serving alias or router. If source records continue changing during the rebuild, reconcile those changes into the candidate index before promotion.

A collection alias switch simplifies global cutover, but writing vectors and switching an external pointer do not inherently form one distributed transaction. Readers should resolve one coherent release per request. Long-running agent tasks may pin the index release used for their evidence.

## Cache invalidation follows dependency changes

| Cache | Revision information that belongs in its identity |
|---|---|
| Document embeddings | Normalized content hash, encoder and preprocessing release |
| Query embeddings | Query text normalization, encoder and task mode |
| Search results | Query, index release, filters and authorization scope |
| Reranker results | Query, candidate versions and reranker revision |
| Generated answers | Evidence versions, prompt, generator and policy |

Metadata-only updates may not require re-embedding when metadata was excluded from encoder input. Permission changes can still invalidate search-result and answer caches immediately.

Index storage grows with both vector count and dimensionality. A new encoder with larger vectors may improve retrieval quality while making replication and memory limits more expensive. The controlled [model selection experiments]({{ '/ai-engineering/retrieval/retriever-generator-selection/' | relative_url }}) determine whether the trade-off is worthwhile.
