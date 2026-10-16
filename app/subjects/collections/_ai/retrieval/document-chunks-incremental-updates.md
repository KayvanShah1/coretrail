---
title: "Document chunking, revisions and incremental indexing"
description: "Preserve source meaning across parsing, chunk updates, deletes, late revisions and index publication."
chapter: retrieval
order: 2
sequence: 602
level: Intermediate
keywords: [chunking, semantic chunking, parent child retrieval, content hash, incremental embedding, index freshness]
aliases: [document revision indexing, chunk update strategy]
interview_queries: [how do you update embeddings when a document changes, how do you version RAG chunks]
references:
  - title: LlamaIndex ingestion and document management
    url: https://docs.llamaindex.ai/en/stable/module_guides/loading/ingestion_pipeline/
---
A retrieval index holds a derived view of source documents. Updating the source is only the beginning: parsing, chunking, embeddings, lexical indexes, citations, access-control lists and caches must eventually agree about which revision is active. A stale chunk can produce an authoritative-looking citation to a value that has already been corrected.

## Choosing the unit of retrieval

Fixed-size windows are simple and predictable. Recursive splitting preserves paragraphs and separators where possible. Structure-aware splitting follows sections, tables, code functions and other logical units. Semantic splitting detects changes of topic, but its boundaries can shift when the embedding model or threshold changes.

| Material | Useful unit | Failure to check |
|---|---|---|
| Narrative report | Section or coherent paragraph | Heading and definition separated |
| Financial table | Table or row with repeated headers | Value detached from column and date |
| Source code | Function, class or syntax-tree region | Definition detached from its dependencies |
| Policy | Clause with effective date | Exception or jurisdiction omitted |
| Long manual | Small searchable child plus larger parent | Parent wastes the context budget |

A 200-token child can retrieve a technical term precisely while the larger parent supplies its definition. Parent-child retrieval trades a little more context for a more complete explanation. Record both identities; otherwise a document revision makes previously returned citations difficult to reconcile.

Overlap affects updates. Replacing a sentence at the end of one chunk can alter that chunk and its neighbor. Recompute the affected chunking region before deciding what needs embedding.

## Versioning identities and content

Maintain a stable logical `document_id`, a source revision, logical section IDs and content fingerprints. A chunk hash describes the normalized text actually passed to the encoder. The configuration that created it matters just as much as the source file.

```text
document_id: regulations-1042
source_revision: 8
section_id: pricing/table-1
source_hash: sha256:...
chunk_hash: sha256:...
parser_version: pdf-parser-3
chunker_version: section-aware-2
embedding_version: retrieval-embeddings-v3
index_release: policies-2026-10
valid_from: 2026-01-01
indexed_at: 2026-10-15T09:00:00Z
```

Two identical paragraphs in different documents may share an embedding-cache entry while retaining distinct document identity and permissions. Content-addressed IDs alone cannot support citation stability, deletion propagation or ownership.

## Incremental update lifecycle

{% capture diagram_code %}
flowchart TD
A["Source event / revision"] --> B["Parse and normalize"]
B --> C["Compare document, section and chunk hashes"]
C --> D{"Content used for embedding changed?"}
D -- "No" --> E["Update metadata / permission indexes if needed"]
D -- "Yes" --> F["Rechunk affected region and re-embed changed chunks"]
F --> G["Stage lexical and vector changes"]
E --> G
G --> H["Validate coverage, citations and ACLs"]
H --> I["Activate new revision"]
I --> J["Invalidate version-dependent caches"]
{% endcapture %}
{% capture diagram_fallback %}
Source revision → parse → compare hashes → regenerate affected chunks/embeddings or update metadata → stage indexes → verify → activate revision → invalidate caches.
{% endcapture %}
{% include diagram.html title="Incremental document-index publication" code=diagram_code fallback=diagram_fallback caption=true %}

For short or irregular documents, full-document reprocessing can be cheaper to maintain than precisely calculating incremental impact. Section-aware revisions become attractive for large documents with stable headings or structured content. Either strategy must account for removed sections and changed access permissions.

A naive delete-then-insert can create a gap in search results. Insert-then-delete can expose contradictory old and new revisions. Stage a revision, validate it and switch an active pointer, or use a separate collection with an alias for large migrations. The pointer and remote index writes are not automatically one transaction; readers need an explicit consistency rule.

## Temporal validity and deletes

`valid_from` describes when a rule applies; `indexed_at` records when the system learned it. A question about a prior year may need an older valid fact even when a newer document revision exists. Effective time and system time should remain distinguishable.

Deletion should retire search entries and remove or invalidate query caches, context artifacts and derived copies according to retention policy. A cached answer must incorporate the source revision and authorization scope, since identical wording may have different permitted evidence for different users.

The related [embedding migration]({{ '/ai-engineering/retrieval/embedding-index-migrations/' | relative_url }}) addresses full model replacements. [Data contracts and schema evolution]({{ '/data-engineering/reliability/schema-evolution-and-contracts/' | relative_url }}) cover the same compatibility problem for structured datasets.
