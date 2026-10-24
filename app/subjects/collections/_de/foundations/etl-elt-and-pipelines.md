---
title: "ETL, ELT, and the source-to-warehouse path"
description: "Follow an event through the pipeline and decide where transformation belongs."
chapter: foundations
order: 1
sequence: 101
level: Core
mermaid: true
keywords:
  - ETL, ELT, and the source-to-warehouse path
interview_queries:
  - explain etl, elt, and the source-to-warehouse path
---

Extract, transform, load (ETL) changes records before they enter the target system. Extract, load, transform (ELT) loads them and then uses the destination engine, such as BigQuery, for transformation. Many production platforms use both: early validation and sensitive-field handling before ingestion, then SQL-driven models in the warehouse.

## Follow a realistic pipeline

{% capture diagram_code %}
flowchart TD
A["Source APIs / devices"] --> B{"Batch file or event?"}
B -- "Events" --> C["Pub/Sub ingestion"]
B -- "Files" --> D["Cloud Storage landing"]
C --> E["Dataflow validation + deduplication"]
D --> E
E --> F["BigQuery raw / staging"]
F --> G["dbt models: facts and dimensions"]
G --> H["Dashboards / applications / forecasting"]
E -. "quarantine invalid data" .-> Q["Rejected records and replay"]
{% endcapture %}
{% capture diagram_fallback %}
Source APIs or devices arrive as events or files, then pass through validation and deduplication into BigQuery staging. dbt produces facts/dimensions consumed by analytics. Invalid records are quarantined for review and replay.
{% endcapture %}
{% include diagram.html title="Batch and event ingestion converge on validated analytical models" code=diagram_code fallback=diagram_fallback caption=true %}

Pub/Sub transports asynchronous messages. Cloud Storage provides durable objects and can preserve a replayable archive. Dataflow processes distributed input; BigQuery handles analytical SQL. Airflow or Cloud Composer orchestrates dependencies. Each component has a different failure and cost model.

A raw landing table may accept a newer source schema while a curated model still expects yesterday's field names. [Schema evolution and data contracts]({{ '/data-engineering/reliability/schema-evolution-and-contracts/' | relative_url }}) follows that change through Bronze, Silver and Gold, including the consumer migration work.

## Decide whether streaming is required

Suppose readings arrive every fifteen seconds but the consumer only refreshes every five minutes. A five-minute micro-batch may satisfy the agreed freshness while reducing idle compute. Streaming is valuable when event-time windows, continuous detection or very low latency are genuine requirements. Compare end-to-end age of usable data, not merely source publish time.

The first questions are: how much arrives, how often, at what peak rate, and what can safely be late? For 100 million daily 1 KB events, raw payload is around 100 GB/day; peak rate and key distribution may matter more than the daily average.

## Recovering from partial ingestion

If extraction succeeds but warehouse loading fails, a cursor advanced after extraction can permanently skip records. Store batch/run identity and move the committed checkpoint only according to the destination's recovery protocol. Repeated attempts need idempotent writes.

## When warehouse SQL is enough

A warehouse-side SQL aggregation can be cheaper to maintain than a separate Spark application. Choose Spark or Beam when code, specialized processing, streaming semantics or distributed transformation requirements justify them. Avoid making a product choice before stating the workload and its operational constraints.
