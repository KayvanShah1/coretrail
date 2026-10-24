---
title: "Airflow, Composer, dbt, and repeatable backfills"
description: "Separate orchestration from distributed execution and preserve interval correctness."
chapter: orchestration
order: 1
sequence: 601
level: Core
keywords:
  - Airflow, Composer, dbt, and repeatable backfills
interview_queries:
  - explain airflow, composer, dbt, and repeatable backfills
---

Airflow expresses workflow dependencies as directed acyclic graphs (DAGs). A scheduler identifies task instances ready to run, while executors and workers perform work. Cloud Composer manages Airflow infrastructure on GCP. Airflow should submit heavy processing to Dataflow, Dataproc or BigQuery rather than load large datasets into its own Python task memory.

## Logical dates matter

A DAG's logical date identifies a scheduled data interval, not necessarily the wall-clock time the task starts. A reproducible backfill uses that interval to select historical input. Using the current clock time inside every extraction step risks reading today's data during a historical rerun.

A retry repeats a failed task attempt; a backfill runs historical intervals. Neither guarantees correctness unless writes are recoverable and idempotent.

## Warehouse transformations with dbt

dbt defines SQL models, dependency relationships, materializations and tests. Staging models normalize inputs, intermediate models apply reusable logic, and marts represent facts and dimensions.

An incremental model filters changed records and uses a supported insert or merge strategy. Its unique_key must match the actual target grain. A single timestamp watermark can miss late updates. Overlap plus deterministic deduplication or a proper CDC change feed may be needed.

A shared dbt model can enforce a declared output contract, while an incremental model's `on_schema_change` setting only governs how its target columns change. Neither can infer whether an upstream rename preserves meaning. See [Schema evolution and model contracts]({{ '/data-engineering/reliability/schema-evolution-and-contracts/' | relative_url }}) for the complete change process.

## A dependable dependency chain

~~~text
extract interval → archive raw data → validate staging
         → merge target → reconcile & test → publish checkpoint
~~~

An Airflow task reporting success does not prove that every expected device contributed data. Treat readiness, freshness and business reconciliation as explicit checks. Monitor task retries, dependency queues, processing latency and downstream data age separately.
