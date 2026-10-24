---
title: "Spark execution, Dataflow, shuffles, and watermarks"
description: "Compare distributed processing engines and explain skew or late-event failures."
chapter: processing
order: 1
sequence: 501
level: Core
keywords:
  - Spark execution, Dataflow, shuffles, and watermarks
interview_queries:
  - how do event time and watermarks handle late data
references:
  - title: Apache Beam programming model
    url: https://beam.apache.org/documentation/programming-guide/
---

Spark's driver plans and coordinates execution; executors run tasks on partitions. DataFrame transformations are generally lazy and an action triggers the required jobs. Stages are divided at exchange boundaries, such as a shuffle. Filtering is usually narrow; grouping and many joins require redistributing records by key.

## Exchange boundaries and skew

Network transfer, serialization, sorting and disk spill can dominate a job. If one merchant has a disproportionate share of records, the partition processing that key can stall a stage. Inspect task-duration spread, shuffle-read sizes, spill and the physical plan. Possible fixes include filtering early, broadcasting genuinely small join inputs, adaptive query execution (AQE), improved partitioning or salting hot keys with correct recombination.

Repartition usually redistributes records with a shuffle. Coalesce can reduce partition count with less movement but may reduce useful parallelism. More partitions are not always better.

## Beam and Dataflow

Apache Beam supplies PCollections and PTransforms for batch and streaming; Dataflow is Google's managed Beam execution engine. Dataproc and serverless Spark suit workloads written in Spark APIs. BigQuery SQL may be sufficient when the required transformations already live in a warehouse.

## Event time, processing time and watermarks

Event time describes when the record was created, while processing time describes when it was handled. A reading generated at 10:02 and received at 10:09 still belongs to an event-time 10:00–10:05 window. Ingestion time records when the platform accepted the event, which may differ from both times.

A watermark estimates progress in event time. A window groups records over an interval; a trigger decides when to emit its current result. Once the watermark passes a window's end, an engine can emit an on-time result under its configured policy. This does not prove that no earlier event can ever arrive.

For a 10:00-10:05 window, a reading with event time 10:02 arriving at 10:09 may be late relative to the watermark. The pipeline can update a retained result, route it for correction or reject it according to its lateness policy. State retention bounds how long the processor can revise that window. Define whether consumers receive updates, retractions or only finalized rows.

An ingestion high-water mark is a source extraction cursor; a streaming watermark estimates event-time progress. A checkpoint preserves processing progress and state for recovery. These records have different meanings and should not share one ambiguous last-updated field.

Delivery retries and source duplication follow the [stream acknowledgment and replay contract]({{ '/data-engineering/reliability/stream-delivery-replay/' | relative_url }}). If event-time progress stalls, inspect backlog, slow source partitions, hot keys and sink throttling alongside worker throughput.

Continuously running processors also face [schema evolution and state migration]({{ '/data-engineering/processing/streaming-schema-evolution/' | relative_url }}): a serializer change can be compatible with new events but incompatible with buffered records or checkpointed state.
