---
title: "Storage & lakehouse tables"
nav_title: Overview
description: "File formats, lakehouse tables, facts, dimensions, and history."
chapter: storage
order: 0
sequence: 300
level: Chapter overview
---

Choose data files, transactional table metadata and query engines from access patterns, update frequency and recovery needs. The [modelling chapter]({{ '/data-engineering/modelling/overview/' | relative_url }}) owns entities, relationships and historical meaning.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/data-engineering/storage/parquet-lakehouse-and-grain/' | relative_url }}">Storage formats, lakehouse tables, and analytical grain</a><span>Understand files, table metadata, partition layout and dimensional correctness.</span></li>
<li><a href="{{ '/data-engineering/storage/one-big-table-feature-data/' | relative_url }}">One Big Table, dimensional models and ML training grain</a><span>Choose representations based on the consumer, updates and join semantics.</span></li>
<li><a href="{{ '/data-engineering/storage/file-formats-table-formats/' | relative_url }}">Parquet, Avro, row formats and lakehouse transactions</a><span>Distinguish serialized records, columnar scans and transactional table metadata.</span></li>
<li><a href="{{ '/data-engineering/storage/delta-iceberg-hudi-operations/' | relative_url }}">Delta Lake, Iceberg and Hudi: selection and operations</a><span>Compare commit semantics, compatibility, update costs and maintenance.</span></li>
</ul>
