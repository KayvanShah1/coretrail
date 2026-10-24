---
title: "Document chunking, revisions and incremental indexing"
description: "Preserve source meaning across parsing, chunk updates, deletes, late revisions and index publication."
chapter: retrieval
order: 2
sequence: 602
level: Intermediate
mermaid: true
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

A revision event must carry a stable source ID, source revision and an event identifier. The ingestion worker first parses the revision with a pinned parser and chunker release, then compares it with the **currently published** manifest. A message arriving late must not silently replace a newer source revision.

{% capture diagram_code %}
flowchart TB
S["Source event with document ID and revision"] --> P["Parse and compare against published manifest"]
P --> D{"Source deleted?"}
D -- "Yes" --> T["Stage tombstone and remove searchable references"]
D -- "No" --> C{"Embedding input changed?"}
C -- "No" --> M["Stage metadata, ACL and validity updates"]
C -- "Yes" --> R["Diff sections and rebuild affected overlapping chunks"]
R --> E["Re-embed changed text with pinned encoder version"]
E --> I["Stage lexical and vector upserts plus removed chunk IDs"]
M --> I
T --> I
I --> V{"Index coverage, citations and permissions valid?"}
V -- "No" --> F["Keep current release active; repair staged revision"]
V -- "Yes" --> A["Promote active document revision or index alias"]
A --> K["Invalidate revision-sensitive search and answer caches"]
K --> O["Check index freshness, stale reads and deletion lag"]
{% endcapture %}
{% capture diagram_fallback %}
The source event identifies a document revision. Parse and compare with the published manifest; a deletion stages a tombstone, a metadata-only change updates filters and permissions, and a text change rebuilds affected chunks and embeddings. Stage lexical and vector changes, validate them, promote the active revision, then invalidate caches and monitor freshness. Failed validation leaves the previous release active.
{% endcapture %}
{% include diagram.html title="Incremental indexing: choose the update path before publishing a coherent revision" code=diagram_code fallback=diagram_fallback caption=true %}

The worker distinguishes **three update paths**:

| Change | Recompute | Keep consistent |
| --- | --- | --- |
| Only title, ACL, category or validity metadata changes | Metadata and filter indexes; re-embed only if the changed fields were part of encoder input | Permissions, result-cache scope and source revision |
| A paragraph, table or code section changes | Reparse affected structure, rebuild impacted chunks and overlap neighbors, re-embed changed hashes | Stable logical section IDs, citation spans, old-chunk removals |
| Source is deleted or access is revoked | Stage tombstone, remove index references and invalidate cached evidence | Query authorization, deletion propagation and retention policy |

For example, updating a price in one long policy manual should normally refresh its table representation and any neighboring chunks that include table headings. There is little reason to re-embed hundreds of unrelated pages if the section boundaries and encoder configuration are stable. Conversely, changing the parser, chunking strategy or embedding model may alter every derived chunk even though the document bytes remain unchanged. In that case, rebuild the affected corpus or a new versioned index instead of applying a tiny document diff.

### Safe publication and recovery

A naive delete-then-insert creates a search gap; insert-then-delete can show contradictory passages from different revisions. Stage new records and removals, verify source-span references and access-control lists (ACLs), then promote a **single active revision pointer** or a versioned index alias. Readers should resolve that pointer once per request to avoid mixing revisions during a multi-stage retrieval.

Promotion of a database pointer does **not** make all remote vector and lexical index writes atomic. Staging, reconciliation, retry-safe operation identifiers and a reader-side release filter are needed where those systems cannot share a transaction. An out-of-order revision event should be ignored or reconciled explicitly rather than overwriting a newer manifest.

Record parser, chunker and embedding versions in the manifest. Cache keys need the active index release, document revision and authorization scope. When a source is removed or permissions shrink, prioritize invalidating exposed results and citations instead of waiting for the next routine embedding refresh.

For short or highly irregular source files, full-document reprocessing may be simpler and more reliable than precise section diffs. Section-aware revisions pay off for long, regularly structured material with frequent small updates. Measure changed chunks per revision, indexing lag, stale-result rate, failed deletions, re-embedding throughput and cache invalidation failures before deciding which approach is cheaper to operate.

## Temporal validity and deletes

`valid_from` describes when a rule applies; `indexed_at` records when the system learned it. A question about a prior year may need an older valid fact even when a newer document revision exists. Effective time and system time should remain distinguishable.

Deletion should retire search entries and remove or invalidate query caches, context artifacts and derived copies according to retention policy. A cached answer must incorporate the source revision and authorization scope, since identical wording may have different permitted evidence for different users.

The related [embedding migration]({{ '/ai-engineering/retrieval/embedding-index-migrations/' | relative_url }}) addresses full model replacements. [Data contracts and schema evolution]({{ '/data-engineering/reliability/schema-evolution-and-contracts/' | relative_url }}) cover the same compatibility problem for structured datasets.
