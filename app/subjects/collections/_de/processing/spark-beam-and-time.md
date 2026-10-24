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
  - explain spark execution, dataflow, shuffles, and watermarks
---

Spark's driver plans and coordinates execution; executors run tasks on partitions. DataFrame transformations are generally lazy and an action triggers the required jobs. Stages are divided at exchange boundaries, such as a shuffle. Filtering is usually narrow; grouping and many joins require redistributing records by key.

## Why shuffles hurt

Network transfer, serialization, sorting and disk spill can dominate a job. If one merchant has a disproportionate share of records, the partition processing that key can stall a stage. Inspect task-duration spread, shuffle-read sizes, spill and the physical plan. Possible fixes include filtering early, broadcasting genuinely small join inputs, adaptive query execution (AQE), improved partitioning or salting hot keys with correct recombination.

Repartition usually redistributes records with a shuffle. Coalesce can reduce partition count with less movement but may reduce useful parallelism. More partitions are not always better.

## Beam and Dataflow

Apache Beam supplies PCollections and PTransforms for batch and streaming; Dataflow is Google's managed Beam execution engine. Dataproc and serverless Spark suit workloads written in Spark APIs. BigQuery SQL may be sufficient when the required transformations already live in a warehouse.

## Three meanings of time

Event time describes when the record was created, while processing time describes when it was handled. A reading generated at 10:02 and received at 10:09 still belongs to an event-time 10:00–10:05 window. A watermark estimates progress in event time; triggers determine when outputs are emitted; allowed lateness determines how late corrections are treated.

Pub/Sub normally offers at-least-once delivery. Even where exactly-once features apply, duplicate source events and external API side effects require idempotency. If backlog grows, inspect publish and consumption rates, watermark lag, hot keys, retries and sink throttling before adding workers.

Continuously running processors also face [schema evolution and state migration]({{ '/data-engineering/processing/streaming-schema-evolution/' | relative_url }}): a serializer change can be compatible with new events but incompatible with buffered records or checkpointed state.
