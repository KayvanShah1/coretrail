---
layout: subject
title: Data Engineering
subject: data-engineering
permalink: /data-engineering/
description: Ingestion, warehousing, distributed computation, and dependable datasets.
keywords: [ETL, ELT, CDC, data modelling, SCD, ACID, Kimball, Lambda, Delta Lake, BigQuery, Spark, Dataflow, Airflow, dbt]
---

## Start with what the data promises

A completed pipeline can still publish duplicate events, outdated dimensions or incorrect totals. To reason about a system, identify the intended record grain, source guarantees, processing latency and the point at which output becomes safe for consumers.

The chapters follow an event from source to warehouse, including how records are reprocessed when a source, worker or sink fails. Cloud services are examples, not substitutes for those decisions.

## Chapters

- [Pipeline architecture]({{ '/data-engineering/foundations/overview/' | relative_url }}) — ETL, ELT, batch, streaming, and choosing where transformations run.
- [Data modelling & transactions]({{ '/data-engineering/modelling/overview/' | relative_url }}) - Entities, relationships, facts, dimensions, SCD history and transactional guarantees.
- [Warehouse & processing architectures]({{ '/data-engineering/architecture/overview/' | relative_url }}) - Kimball, Inmon, Data Vault, Lambda, Kappa, medallion and hybrid designs.
- [Incremental ingestion & CDC]({{ '/data-engineering/incremental/overview/' | relative_url }}) — Watermarks, change streams, idempotency and recovery.
- [Storage & lakehouse tables]({{ '/data-engineering/storage/overview/' | relative_url }}) — File formats, table protocols, layout, maintenance and choosing between Delta Lake, Iceberg and Hudi.
- [GCP & BigQuery]({{ '/data-engineering/gcp/overview/' | relative_url }}) — Query execution, physical layout, capacity and costs.
- [Distributed processing]({{ '/data-engineering/processing/overview/' | relative_url }}) — Spark, Beam, Dataflow, stream schema evolution, event time, and state migration.
- [Orchestration & transformations]({{ '/data-engineering/orchestration/overview/' | relative_url }}) — Airflow, Cloud Composer, dbt, retries, and backfills.
- [Reliability & operations]({{ '/data-engineering/reliability/overview/' | relative_url }}) — Data quality, schema evolution, data contracts, migrations and incident recovery.

For SQL semantics and indexing, visit [SQL]({{ '/sql/' | relative_url }}). Infrastructure mechanics shared with other applications live under [Infrastructure & DevOps]({{ '/infrastructure/' | relative_url }}).
