---
title: "Streaming acknowledgments, retries and replay safety"
description: "Connect Pub/Sub acknowledgment deadlines, idempotent sink writes, dead-letter policies and backlog monitoring."
chapter: reliability
order: 3
sequence: 703
level: Intermediate
mermaid: true
keywords: [Pub/Sub, at least once, exactly once, ack deadline, DLQ, idempotency, backpressure]
aliases: [Pub/Sub acknowledgment window, dead letter queue, streaming retry]
interview_queries: [is PubSub message lost after acknowledgment deadline, how to avoid duplicate BigQuery writes]
references:
  - title: Pub/Sub subscription properties
    url: https://docs.cloud.google.com/pubsub/docs/subscription-properties
  - title: Pub/Sub lease management
    url: https://docs.cloud.google.com/pubsub/docs/lease-management
  - title: Pub/Sub dead-letter topics
    url: https://docs.cloud.google.com/pubsub/docs/dead-letter-topics
  - title: Google Cloud Pub/Sub subscriber guidance
    url: https://cloud.google.com/pubsub/docs/subscriber
---
An acknowledgment deadline is the period during which a subscriber holds a delivered message before the broker considers it eligible for redelivery. Expiration normally makes the message available again; it does not mean the record is automatically lost. Subscriber libraries may extend the lease during long processing, and delivery guarantees depend on subscription configuration.

## Acknowledgment deadline, retention and dead-letter policy

The initial subscription acknowledgment deadline is configurable from **10 to 600 seconds**, according to the linked service documentation checked in October 2026. Pull clients can extend a message's lease while processing, subject to client settings and service limits. A 600-second deadline is therefore different from a ten-minute lifetime for the event.

| Setting | What it controls | Consequence |
|---|---|---|
| Acknowledgment deadline | How long an attempt holds a delivered message | Expiry makes redelivery eligible |
| Lease management | Extensions while a pull worker is still processing | Reduces unnecessary concurrent attempts |
| Message retention | How long retained messages remain available | Expired data may no longer be replayable |
| Dead-letter policy | Forwarding after approximately configured delivery attempts | Needs topic permissions and a receiving subscription |

A five-minute micro-batch cadence describes when processing runs. It does not determine acknowledgment, retention or dead-letter behavior. The subscriber library, trigger or managed processing engine may handle acknowledgments on the application's behalf; inspect that path before assuming every worker needs a hand-written acknowledgment loop.

Dead-letter forwarding is best effort, with an approximate attempt threshold. Pub/Sub cannot infer that an application considers a record permanently invalid. The worker can durably quarantine an invalid event itself, or allow configured delivery attempts to reach the dead-letter policy. Both paths need source identity, error details and a repair/replay procedure.

## Acknowledgment follows durable processing

{% capture diagram_code %}
flowchart TD
P["Publisher"] --> Q["Pub/Sub subscription"]
Q --> W["Worker receives message"]
W --> V{"Validate + persist sink result"}
V -- "Committed" --> A["Acknowledge message"]
V -- "Transient failure" --> R["Retry / lease extension / redelivery"]
R --> W
V -- "Repeated failures under policy" --> D["Dead-letter topic, inspection and repair"]
A --> C["Record processing and freshness telemetry"]
{% endcapture %}
{% capture diagram_fallback %}
Publisher → subscription → worker validates and commits a durable sink result → acknowledge. Transient failures trigger retry/redelivery; poison records can route to a dead-letter topic for repair.
{% endcapture %}
{% include diagram.html title="Durable sink state must precede acknowledgment" code=diagram_code fallback=diagram_fallback caption=true %}

Acknowledging before a successful warehouse write risks silent data loss after a worker crash. Writing before acknowledgment may repeat the write if the broker never receives the acknowledgment. This is why **idempotent sink behavior** matters even with careful ordering.

A business event needs a stable event ID or a source-defined natural key and version. A BigQuery staging-and-MERGE pattern can deduplicate retries against the target grain. A micro-batch may reread an overlap interval to capture late records; deterministic deduplication prevents inflated counts. For change-data-capture events, an orderable source version or log position protects against stale updates replacing newer state.

## At-least-once and exactly-once

Pub/Sub typically uses at-least-once delivery. Exactly-once delivery support exists for qualifying pull subscriptions under particular conditions, but it does not create an atomic transaction between Pub/Sub and arbitrary external databases. Producer duplicates can also enter with distinct message IDs, so downstream business-level deduplication remains necessary.

An acknowledgment deadline may be extended within service limits while processing continues. Monitor redelivery rate, acknowledgment latency, lease extensions, backlog age and oldest-unacked-message age. A configured dead-letter policy should retain enough information to replay a corrected event without losing lineage.

## Capacity and feedback

If producers create 500 events per second while workers can durably commit 300, backlog rises by roughly 200 events per second. More workers help only if the sink, quota and hot-key distribution can absorb them. Retrying aggressively against a throttled warehouse can make the backlog and costs worse.

Monitor end-to-end **event-time to available-data** latency separately from worker execution latency. Use flow control to bound unacknowledged messages per subscriber. Backpressure is an application control mechanism as well as a broker metric.

The [incremental CDC chapter]({{ '/data-engineering/incremental/cdc-checkpoints-and-merge/' | relative_url }}) owns watermarks and replayable MERGE semantics. [Stream time and watermarks]({{ '/data-engineering/processing/spark-beam-and-time/' | relative_url }}) describes late-event windows.
