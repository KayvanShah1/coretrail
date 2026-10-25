---
title: "Storage & lakehouse tables"
nav_title: Overview
description: "File formats, table protocols, physical layout and storage selection."
chapter: storage
order: 0
sequence: 300
level: Chapter overview
---

Choose record serialization, table semantics and physical layout from the workload. The [modelling chapter]({{ '/data-engineering/modelling/overview/' | relative_url }}) explains row meaning and relationships; [platform design]({{ '/data-engineering/architecture/lake-warehouse-design/' | relative_url }}) explains catalogs, compute and analytical serving.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/data-engineering/storage/file-formats-table-formats/' | relative_url }}">Parquet, Avro, ORC and row-oriented file formats</a><span>Choose serialization, columnar scans, schema handling and compression.</span></li>
<li><a href="{{ '/data-engineering/storage/delta-iceberg-hudi-operations/' | relative_url }}">Delta Lake, Iceberg and Hudi: selection and operations</a><span>Commit semantics, compatibility, update costs and retention.</span></li>
<li><a href="{{ '/data-engineering/storage/partitioning-file-sizing/' | relative_url }}">Lake partitioning, clustering and Parquet file sizing</a><span>Estimate bytes per partition and test file layout against reads and updates.</span></li>
<li><a href="{{ '/data-engineering/storage/workload-storage-selection/' | relative_url }}">Choosing storage from data shape, access pattern and scale</a><span>Match transactions, telemetry, documents, analytics and search to a store.</span></li>
</ul>
