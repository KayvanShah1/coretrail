---
title: "Parquet, Avro, row formats and lakehouse transactions"
description: "Choose serialization and table formats based on access pattern, schema evolution, incremental updates and snapshot consistency."
chapter: storage
order: 3
sequence: 303
level: Intermediate
mermaid: true
keywords: [Parquet, Avro, ORC, JSON, Delta Lake, Iceberg, Hudi, row group, predicate pushdown, ACID]
aliases: [storage file formats, Delta vs Iceberg, columnar vs row oriented]
interview_queries: [why use Parquet rather than CSV, what do Delta and Iceberg add, what is ACID on an object store]
references:
  - title: Apache Parquet format
    url: https://parquet.apache.org/docs/
  - title: Apache Iceberg specification
    url: https://iceberg.apache.org/spec/
  - title: Delta Lake documentation
    url: https://docs.delta.io/
---
A storage format describes how records become bytes. A **table format** additionally coordinates which files form a consistent logical dataset at a particular snapshot. The distinction matters when ingestion writes new data while readers query historical intervals.

## Row-oriented and column-oriented bytes

A row-oriented file keeps attributes of an event close together, which suits serialization of complete records. Avro stores structured row-oriented records with schema metadata and supports controlled reader/writer evolution. JSON is easy to inspect and integrate but tends to be larger and less strictly typed unless schema validation is added.

Columnar formats such as Parquet and ORC group values from a column together. Analytical queries often read a subset of columns across many rows, so column projection, compression and statistics allow them to avoid unnecessary I/O. Parquet row groups and column chunks carry statistics that can support row-group skipping.

{% capture diagram_code %}
flowchart LR
A["Source records"] --> B{"Access pattern"}
B -- "Exchange / streaming events" --> R["Avro / JSON row records"]
B -- "Analytical scans" --> C["Parquet / ORC columnar files"]
C --> T["Table metadata: snapshots + schema"]
T --> Q["SQL engine / Spark / warehouse"]
R --> P["Stream decoder / connector"]
{% endcapture %}
{% capture diagram_fallback %}
Streaming exchange favors row-record serialization such as Avro or JSON, while analytical scans often favor Parquet or ORC. A lakehouse table format adds consistent metadata snapshots over the columnar files consumed by compute engines.
{% endcapture %}
{% include diagram.html title="File format and table semantics answer different questions" code=diagram_code fallback=diagram_fallback caption=true %}

## Why a folder of Parquet files is insufficient

Imagine a reader scanning a dataset while a writer deletes old files and uploads replacements. The reader may see some old files and some new ones without a transaction protocol, even if each individual Parquet file is valid. Re-running a failed job can leave duplicate records or orphan files.

Delta Lake, Apache Iceberg and Apache Hudi each define metadata, commit and snapshot mechanisms around data files, with differing approaches to manifests/logs, indexing, updates and concurrency control. A reader selects a consistent table snapshot, while a writer commits its changes according to the table protocol. The object store itself does not magically provide multi-file transactions.

| Concern | Data files alone | Managed lakehouse table format |
|---|---|---|
| Consistent multi-file read | Requires custom publication scheme | Snapshot/transaction metadata |
| Schema updates | Reader must interpret individual files | Table-level schema/compatibility policy |
| Incremental upserts/deletes | Manual file rewrite and tracking | Format-supported update workflows |
| Time travel | Keep and address manual snapshots | Historical table snapshots within retention |
| Cleanup | Custom orphan-file process | Vacuum/expiration procedures with constraints |

Metadata maintenance, small-file compaction and snapshot retention are ongoing costs. A long-lived reader may pin old files; aggressive cleanup can break it. Schema compatibility remains a data-contract question even when a table supports adding columns.

## Partitioning, clustering and file size

A path partition such as \`date=2026-10-24/\` can limit scan scope when queries filter that date. Overpartitioning by a high-cardinality key creates huge numbers of tiny files and metadata requests. Clustering sorts data within partitions to help row-group pruning. Optimal choices depend on query patterns, ingest rate and update frequency.

BigQuery managed columnar storage and transactional PostgreSQL tables expose different storage abstractions. A team may retain Parquet in Cloud Storage or S3 for portable raw/curated data while placing serving facts in an analytical warehouse.

See [lakehouse grain and data layout]({{ '/data-engineering/storage/parquet-lakehouse-and-grain/' | relative_url }}) and [incremental CDC/MERGE]({{ '/data-engineering/incremental/cdc-checkpoints-and-merge/' | relative_url }}).
