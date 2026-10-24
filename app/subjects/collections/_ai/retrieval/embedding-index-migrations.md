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

Changing only the generation language model ordinarily leaves document embeddings intact, since the generator receives retrieved text. Changing passage text, embedding preprocessing or encoder space requires recomputing affected embeddings. Changing only a search-time Hierarchical Navigable Small World (HNSW) parameter may require no vector update, while changing index-building configuration can require an index rebuild.

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

### Backfill ten million chunks while updates continue

Consider an illustrative corpus of ten million chunks. Building the candidate index can take long enough that live documents change during the backfill. Record a source-log position or another durable change cursor when taking the snapshot. Retain subsequent changes until the candidate has caught up; a cursor without retained events cannot repair the gap.

Partition the backfill into retryable batches keyed by logical document/chunk identity and source revision. A checkpoint records completed batches, failures and the encoder release. Retry with the same identities so a restarted worker upserts the same derived records. If parser or encoder configuration changes midway, begin a clearly identified release instead of mixing representations.

Replay changes newer than the snapshot cursor, including tombstones and permission updates. A delayed backfill record for revision 8 must be rejected when revision 9 or a revision-10 deletion has already been applied. Compare source and index manifests by revision and partition; a matching total count can hide one missing document and one duplicate.

| Promotion check | Evidence needed |
|---|---|
| Corpus coverage | Expected IDs and revisions, not only total vectors |
| Catch-up | Applied change cursor and bounded source-to-index lag |
| Retrieval | Paired authorized queries, relevance and sufficient-evidence coverage |
| Operations | Build failures, latency under load, memory and replica cost |
| Rollback | Compatible old query encoder and a current, permitted old index |

Shadow queries need the query encoder paired with each candidate index. An atomic router configuration can select an encoder/index release together. Changing only an index alias while leaving the old query encoder active can break retrieval.

During a rollback window, continue applying source changes and permission revocations to the retained release, or define how it will be caught up before serving again. Pinned historical tasks still need live authorization checks. Retaining old vectors for recovery cannot preserve access that has been revoked.

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
