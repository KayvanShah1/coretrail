---
title: "Storage formats, lakehouse tables, and analytical grain"
description: "Understand files, table metadata, partition layout and dimensional correctness."
chapter: storage
order: 1
sequence: 301
level: Core
keywords:
  - Storage formats, lakehouse tables, and analytical grain
interview_queries:
  - explain storage formats, lakehouse tables, and analytical grain
---

CSV is a widely supported row-oriented text format, but it has no native column typing or column statistics. Parquet uses compressed columnar data with row-group metadata, allowing analytical readers to scan relevant fields and sometimes skip row groups. Avro is row-oriented with a schema and is common for record interchange; JSON allows flexible nested fields but needs explicit type and missing-value handling.

## A file is different from a table

Apache Iceberg, Delta Lake and Apache Hudi add transaction and metadata protocols around collections of data files. Features vary by format and engine, but can include snapshots, schema evolution and safe concurrent writes. A bucket full of Parquet files does not, on its own, make a multi-file update atomic. Adding a field to the table metadata also does not teach downstream transformations what the new field means. See [Schema evolution, Silver mappings and data contracts]({{ '/data-engineering/reliability/schema-evolution-and-contracts/' | relative_url }}) for the consumer-facing migration.

Tiny files increase metadata and task scheduling overhead. Partitioning by an excessively high-cardinality key can create many nearly empty directories or partitions. Compaction and layout optimization help, but rewrite data and consume I/O.

## Facts and dimensions

Define the grain before joining. One meter reading per meter per timestamp differs from a daily meter-consumption row. The first is an event-grain fact; the second is an aggregate fact.

A dimension holds descriptive attributes. Slowly changing dimension (SCD) Type 1 overwrites an old value; Type 2 maintains historical versions with effective dates or surrogate version keys. If a meter changes region, historical reports may need the old region when analyzing earlier readings.

A join from a fact to all historical dimension versions can multiply the measure. Join using the correct effective interval or resolved version key, then test fact uniqueness, dimension coverage and whether totals changed unexpectedly.

For relational mechanics see [Database design]({{ '/sql/design/overview/' | relative_url }}).
