---
title: "Pipeline fundamentals: contracts, checkpoints and publication"
description: "Define source and output guarantees, durable stages and consumer-ready releases for batch and streaming pipelines."
chapter: "foundations"
order: 3
sequence: 103
level: "Core"
mermaid: true
keywords: ["pipeline basics","data contract","run manifest","checkpoint","source cursor","staging","atomic publication","reconciliation","data freshness"]
interview_queries: ["what metadata should a pipeline record","when should a pipeline checkpoint advance"]
last_verified: "2026-10-25"
references: [{"title":"Airflow best practices","url":"https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html"},{"title":"Apache Beam programming model","url":"https://beam.apache.org/documentation/programming-guide/"},{"title":"dbt model contracts","url":"https://docs.getdbt.com/docs/mesh/govern/model-contracts"},{"title":"OpenLineage object model","url":"https://openlineage.io/docs/spec/object-model/"}]
---

A pipeline reads a defined set of source records, applies versioned transformations and publishes an output consumers can interpret. A scheduler starting a task and a process exiting successfully are only execution events. The output also needs correct grain, coverage and freshness.

## Define the input and output promises

Before choosing tools, record the source's identity, pagination or change cursor, ordering guarantees, schema and retention. Define the output grain, keys, units, timezone, null policy and how inserts, updates and deletes affect it. Specify the acceptable source-to-availability delay and the response to invalid records.

A minute of device telemetry might include event timestamps, arrival timestamps and device sequence numbers. An absent interval could mean zero output, an offline device or a missing extract. Those interpretations require different transformations.

Batch processes bounded input. A micro-batch repeatedly processes short bounded ranges. Streaming maintains an ongoing computation, often with state and event-time rules. The distinction changes scheduling and state management, while all three still need source identity, correctness checks and recovery.

## Durable stages make failure explainable


{% capture diagram_1 %}
flowchart TD
S["Source range or change cursor"] --> R["Persist raw records and input manifest"]
R --> E["Record durable extraction progress"]
R --> T["Transform with pinned code and schema"]
T --> V{"Counts, keys and business totals reconcile?"}
V -- "No" --> Q["Retain evidence and quarantine or repair"]
Q --> T
V -- "Yes" --> C["Commit candidate output"]
C --> P["Publish output release and processed checkpoint"]
P --> D["Consumers read the verified release"]
{% endcapture %}
{% capture fallback_1 %}
Persist raw input and its manifest before recording extraction progress. Transformation and validation can resume from that input. Publish a consumer-ready release only after the candidate output commits and reconciles.
{% endcapture %}
{% include diagram.html title="Separate extraction progress from verified output publication" code=diagram_1 fallback=fallback_1 caption=true %}


A source-to-log connector can advance its own offset after the log durably accepts records, even while the warehouse is behind. A transformation stage has a separate processed checkpoint. Combining these into one “last updated” timestamp hides gaps.

A logical batch key identifies the intended work, such as pipeline, interval and source revision. A run ID identifies an execution; an attempt identifies a retry. Retries should refer to the same logical input and sink operation unless the operator explicitly chooses a new revision.

~~~yaml
pipeline: meter-minute-facts
logical_interval: "[2026-10-24T10:00Z,2026-10-24T10:05Z)"
run_id: run-1042
attempt: 2
input_manifest: raw-manifest-271
source_cursor_end: source-defined-position
transform_release: normalize-v6
target_grain: [device_id, interval_start]
output_release: facts-1042
publication_state: validated
~~~

This illustrative application manifest records each stage's evidence. Its cursor field must retain the source's actual semantics, whether a timestamp, partition offset or database log position.

## Transformation and publication choices

Choose execution from data location, operation shape, active state and the completion deadline. The [transformation-tool comparison]({{ '/data-engineering/orchestration/transformation-tool-selection/' | relative_url }}) connects those requirements to engines; this page follows durable stages and publication.

For replacement outputs, write a new table/partition or staged release, verify it and switch a supported pointer or transaction. For incremental outputs, enforce stable keys and source-version rules. Direct append is appropriate only when duplicates and corrections are addressed by the model.

One table's commit need not make a set of marts mutually consistent. A publication manifest can name the compatible snapshots for a report, with consumers resolving that release once. A freshness marker identifies verified coverage; task start time remains separate execution metadata.

## Quality checks need business meaning

Check schema, keys, counts, accepted source ranges and totals by meaningful subgroup. A count matching the source can still conceal one duplicate and one missing record. Compare identifiers or partition-level checksums where appropriate, and reconcile monetary amounts in consistent currencies and units.

A dead-letter queue (DLQ) or quarantine store needs error reason, source position, schema version and replay ownership. Quarantine is an explicit policy for rejected records; it should not silently turn an incomplete output into a complete one.

## Fail-safe behavior is chosen per consumer

A report can continue serving a clearly labeled last-known-good release during repair. A payment or safety decision may need to stop if required data is stale. A pipeline can be available while untrustworthy, so consumers need readiness and freshness contracts.

[Recovery and backfills]({{ '/data-engineering/reliability/recovery-replay-backfills/' | relative_url }}) explains how durable stages support reconstruction. [Metadata and lineage]({{ '/data-engineering/reliability/metadata-lineage-tools/' | relative_url }}) explains how the records become searchable and auditable.
