---
title: "Parquet, Avro, ORC and row-oriented file formats"
description: "Choose file serialization, column projection, compression and schema handling from the records and access pattern."
chapter: storage
order: 1
sequence: 301
level: Core
last_verified: "2026-10-25"
keywords: [Parquet, Avro, ORC, JSON, CSV, columnar, row group, compression, file format vs table format]
aliases: [storage file formats, columnar vs row oriented]
interview_queries: [why use Parquet rather than CSV, when should I use Avro instead of Parquet]
references:
  - title: Apache Parquet format
    url: https://parquet.apache.org/docs/
  - title: Apache Avro specification
    url: https://avro.apache.org/docs/1.12.0/specification/
  - title: Apache ORC specification
    url: https://orc.apache.org/specification/ORCv1/
  - title: DuckDB Parquet scan guidance
    url: https://duckdb.org/docs/2.0/guides/performance/file_formats
---

A file format describes how records become bytes and how readers recover them. Choose it from the exchange contract and expected read pattern. A format that is convenient for delivering complete events may do unnecessary work for an analytical query reading three columns from millions of rows.

## Row records and columnar scans

| Format | Representation and useful workload | Cost or obligation |
|---|---|---|
| CSV | Row-oriented text exchanged with widely available tools | Declare types, escaping, null representation and date conventions |
| JSON or newline-delimited JSON | Nested records and source/API interchange | Repeated field names, parsing cost and explicit schema validation |
| Avro | Schema-based binary row records and reader/writer schema resolution | Evolution must obey compatibility rules; it is not a column-pruning format |
| Parquet | Typed columnar analytical files with nested-data support | Writer layout, statistics, codec and reader compatibility affect scans |
| ORC | Typed columnar files with stripes, indexes and statistics | Select it when the engine ecosystem and measured workload fit |

A Parquet row group contains column chunks for a group of rows. Reading amount and event_date need not require decoding an unrelated description column. Statistics such as minimum and maximum values can also exclude ranges that cannot match a filter, if the reader supports that optimization.

ORC stripes likewise contain column streams and associated metadata. Both formats can reduce analytical I/O; the engine's implementation and the data determine the observed result.

For an event consumer that normally decodes the complete record, a row serialization can be appropriate. Kafka or Pub/Sub carries messages; Avro or JSON can encode a message's payload. The transport and payload format have separate contracts.

## Schema and compression choices

A CSV value such as 00123 may be an identifier, not an integer. A JSON field can be absent, explicitly null or present with an unexpected type. Preserve these distinctions during raw ingestion and define their curated interpretation.

Avro writer and reader schemas support controlled evolution; a newly accepted source field still needs a business mapping downstream. The [schema-contract reference]({{ '/data-engineering/reliability/schema-evolution-and-contracts/' | relative_url }}) works through those semantic migrations.

Compression codecs trade bytes transferred against encoding/decoding CPU and compatibility. Test supported options such as Snappy or Zstandard on representative data. Compression ratio varies with repetition, types and ordering, so a fixed storage multiplier should be an explicit capacity assumption.

A compressed file size is not its decoded memory footprint. File size and row-group size are separate controls; use [partitioning and file sizing]({{ '/data-engineering/storage/partitioning-file-sizing/' | relative_url }}) for that design.

## File formats and table protocols

A reader can decode every Parquet file correctly yet see an inconsistent collection during a multi-file replacement. A table protocol records which files belong to a committed version and how changes become visible.

[Delta Lake, Iceberg and Hudi operations]({{ '/data-engineering/storage/delta-iceberg-hudi-operations/' | relative_url }}) covers snapshot commits, compatibility, update costs and retention. A supported Delta read follows that protocol; scanning every Parquet object under the table path can include superseded or uncommitted data.

A managed warehouse can control its own internal storage while accepting these formats for loading or external queries. Select the exposed import/read contract rather than assuming its internal layout is a user-managed Parquet directory.
