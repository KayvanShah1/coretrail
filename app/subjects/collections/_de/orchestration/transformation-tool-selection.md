---
title: "Choosing a data transformation tool and execution engine"
description: "Match data location, operation shape, active state, freshness and team constraints to SQL, DataFrame or distributed processing."
chapter: orchestration
order: 3
sequence: 603
level: Core
last_verified: "2026-10-25"
keywords: [transformation tool, dbt, Dataform, DuckDB, Polars, Spark, Beam, Flink, SQL vs Python, data volume]
interview_queries: [when should I use Spark instead of SQL or Polars, how do I choose a data transformation tool]
references:
  - title: dbt introduction and product scope
    url: https://docs.getdbt.com/docs/introduction
  - title: Dataform overview
    url: https://docs.cloud.google.com/dataform/docs/overview
  - title: Polars streaming execution and fallbacks
    url: https://docs.pola.rs/user-guide/concepts/streaming/
  - title: DuckDB larger-than-memory workloads
    url: https://duckdb.org/docs/2.0/guides/performance/how_to_tune_workloads
  - title: Spark SQL performance tuning
    url: https://spark.apache.org/docs/latest/sql-performance-tuning.html
  - title: Beam programming guide
    url: https://beam.apache.org/documentation/programming-guide/
---

A transformation tool should fit the expensive operation and where its input already lives. A terabyte filtered down to a few columns can be easier than a much smaller many-to-many join. Record daily ingress, bytes actually scanned, peak rate, active state, completion deadline and recovery window before comparing tools.

## Separate the responsibilities

| Responsibility | Examples | Selection question |
|---|---|---|
| Durable storage and serving | Object-store tables, BigQuery, PostgreSQL | What must be stored, updated and queried? |
| Execution engine | Warehouse SQL, DuckDB, Polars, Spark, Flink or a Beam runner | Where will joins, scans and state execute? |
| Transformation project | Adapter-backed dbt models, Dataform workflows, versioned Python packages | How are definitions, dependencies and checks maintained? |
| Orchestration | Airflow, Dagster, Argo or a managed workflow | What schedules work and coordinates completion or repair? |

An adapter-backed dbt SQL project submits transformations to its target engine. Its data capacity follows that engine, the model's materialization and the workload. Dataform develops, tests and schedules SQL transformations in BigQuery. Check the selected product and edition: a branded platform can bundle compute and scheduling as well as the project framework.

Airflow launching a Spark job does not turn Airflow workers into the data-processing cluster. The [orchestration reference]({{ '/data-engineering/orchestration/airflow-composer-dbt/' | relative_url }}) explains task instances and logical intervals.

## Choose from the operations

| Workload | Candidate | Why it fits | Evidence to reconsider |
|---|---|---|---|
| Joins and aggregates over warehouse-resident tables | SQL with a transformation project | Avoids exporting data and reimplements fewer platform capabilities | Unsupported computation, repeated costly scans or an unmet deadline |
| Bounded files and relational analysis on one machine | DuckDB | Columnar scans and SQL joins with supported disk spilling | Spill capacity, processor, input/output (I/O) or concurrency limits miss the target |
| Typed DataFrame expressions and file normalization | Polars lazy execution | Projection/filter optimization and supported streaming operators | Required operators materialize too much state or cannot meet the deadline |
| Large distributed batch joins, reshaping or lake-table writes | Spark SQL/DataFrames | Distributes computation and integrates with suitable lake connectors | Small-job startup dominates or skew remains the limiting stage |
| Continuous event-time computation with late data | Beam on a suitable runner or Flink | Explicit windows, keyed state and recovery mechanisms | State growth, hot keys, sink limits or recovery time breach requirements |
| Connector-oriented movement with modest mappings | Managed ingestion/ETL service | Less custom extraction and connector maintenance | Unsupported change semantics, weak replay controls or prohibitive charges |

Lazy execution postpones work so the optimizer can build a combined plan. It does not guarantee low memory. Polars documents that some operations fall back to in-memory execution; inspect the actual streaming plan. DuckDB can process many larger-than-memory workloads by spilling, but the supported operators, temporary disk and concurrent work still matter.

Use [streaming time and watermarks]({{ '/data-engineering/processing/spark-beam-and-time/' | relative_url }}) to decide whether continuous state is needed. Repeated five-minute SQL jobs can be simpler when that freshness meets the requirement.

## What changes as volume grows?

The examples below are planning scenarios, not product limits.

| Illustrative workload | Reasonable first experiment | The deciding measurement |
|---|---|---|
| 3 GB of daily files, simple casts and a small lookup | One DuckDB or Polars job | Peak memory, local/remote I/O and runtime |
| 100 GB/day already in BigQuery, hourly SQL marts | Incremental warehouse SQL with dbt or Dataform | Bytes reprocessed, slot use, freshness and cost |
| 20 TB historical lake join with a fixed backfill deadline | Distributed Spark trial alongside any existing capable SQL engine | Shuffle volume, spill, skew and completion time |
| 50,000 events/second with keyed ten-minute windows | Stateful stream processor | Peak arrivals, retained keys, state size, checkpoints and sink throughput |
| A 5 TB table with only 200 MB of relevant daily changes | Incremental processing in the existing engine | Correct change capture and actual scan/rewrite amplification |

A simple payload calculation at 50,000 events/second and 1 KB/event gives 50 MB/second and 30 GB arriving in ten minutes, using decimal units. An aggregation may retain one accumulator per active key; an exact join or deduplication window may retain many events. Input volume is not the same as active state.

Moving a job to a cluster adds scheduling, network shuffle, retries and cluster operation. A single-node engine can remain appropriate when the working set, spill and deadline fit. Conversely, a small but continuously updated dataset may need distributed availability or state recovery for reasons unrelated to total stored bytes.

## Compare complete runs

Use the same input version, key rules and output grain. Measure end-to-end runtime, startup, peak memory, temporary disk, bytes read and written, failed-attempt cost, operator effort and recovery after interruption. Include data transfer when moving computation away from storage.

Test an ordinary interval, a skewed interval and a backfill. Confirm late updates and deletes as well as inserts. A faster full refresh can still violate the incremental contract if it drops history or rewrites current data during a historical rerun.

Keep one transformation definition per owned output wherever possible. Materialize expensive reusable results deliberately; a common table expression or a shared source file does not guarantee the engine computes it only once. [Query plans]({{ '/data-engineering/processing/query-plans-pruning/' | relative_url }}) reveal the executed work, and [capacity estimates]({{ '/data-engineering/foundations/capacity-estimation/' | relative_url }}) turn the deadline into a throughput requirement.
