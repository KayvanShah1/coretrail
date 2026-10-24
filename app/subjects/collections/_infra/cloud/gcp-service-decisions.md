---
title: "GCP service choices, execution limits and failure cases"
description: "Choose messaging, orchestration, processing and storage from workload behavior, then trace the limits across a complete request."
chapter: cloud
order: 2
sequence: 502
level: Intermediate
mermaid: true
keywords: [GCP, Pub/Sub, Cloud Tasks, Cloud Run, Workflows, Cloud Composer, Dataflow, Dataproc, BigQuery, Cloud SQL, Vertex AI, service limits]
aliases: [GCP tool selection, Google Cloud services limitations]
interview_queries: [PubSub vs Cloud Tasks, Workflows vs Composer, Dataflow vs Dataproc, which timeout controls a Cloud Run handler]
references:
  - title: Cloud Tasks and Pub/Sub comparison
    url: https://docs.cloud.google.com/tasks/docs/comp-pub-sub
  - title: Cloud Run service request timeout
    url: https://docs.cloud.google.com/run/docs/configuring/request-timeout
  - title: Pub/Sub subscription properties
    url: https://docs.cloud.google.com/pubsub/docs/subscription-properties
  - title: Cloud Run asynchronous tasks
    url: https://docs.cloud.google.com/run/docs/triggering/using-tasks
  - title: Dataflow overview
    url: https://docs.cloud.google.com/dataflow/docs/overview
  - title: Managed Spark cluster overview
    url: https://docs.cloud.google.com/managed-spark/docs/concepts/clusters-overview
  - title: Google Cloud Workflows overview
    url: https://docs.cloud.google.com/workflows/docs/overview
---

Google Cloud Platform (GCP) provides several ways to run and connect workloads. A document upload, a scheduled warehouse refresh and an agent request create different work. The upload announces a change that several systems may consume. A refresh coordinates known dependencies. An agent request may choose tools dynamically and must preserve user identity. Selecting services starts with those behaviors.

## Events, commands and workflow coordination

| Requirement | Candidate | Constraint that changes the decision |
|---|---|---|
| Announce an event to independent consumers | Pub/Sub | Delivery can repeat; each subscription needs its own processing and replay policy |
| Invoke one endpoint later at a controlled rate | Cloud Tasks | The producer chooses the target; HTTP attempts have a deadline and can repeat |
| Coordinate service calls, waits and retries | Workflows | Processing remains in called services; retrying a call can repeat its external effect |
| Schedule dependency-heavy data pipelines and backfills | Cloud Composer / Airflow | Environment and scheduler operations add cost; heavy data work belongs in an execution engine |
| Run a container until a finite task completes | Cloud Run jobs | Persist progress for restarts; task retries can repeat writes |
| Serve requests or bounded event handlers | Cloud Run services / functions | Request lifetime, concurrency, downstream quotas and cold starts constrain capacity |

A Pub/Sub publisher can announce "document revision 12 exists" without knowing whether indexing, auditing or analytics consumes it. Each independent consumer uses a separate subscription; workers sharing one subscription divide that subscription's deliveries. Cloud Tasks suits "call this indexing endpoint for document 42 after this time" when dispatch rate and retry controls matter.

Task creation deduplication reduces duplicate enqueues under its documented rules. The handler still needs business-level idempotency because an attempt can finish its side effect before the delivery service records success.

A workflow engine coordinates known steps. An agent framework interprets goals and model-selected actions. A durable orchestration service can run the outer process while an agent performs one bounded step, with its result stored before the workflow advances.

## The shortest deadline controls an attempt

As checked against the linked documentation in October 2026, a Cloud Run service request can be configured up to **60 minutes**. Pub/Sub push processing is limited to **10 minutes**, while a Cloud Tasks HTTP handler can run for at most **30 minutes** per attempt. Client, gateway and application timeouts may be shorter.

An 18-minute task therefore exceeds a Pub/Sub push attempt even if Cloud Run has a 60-minute request timeout. Repeated deliveries can overlap with earlier work. A Cloud Run timeout closes the connection with an error while the container may continue processing; the client needs reconciliation before repeating a state-changing operation.

For longer finite work, a short handler can durably register the job and trigger job execution. Acknowledge only after that handoff is durable. Store the job ID, source revision, progress and result separately so the client can retrieve status. Cloud Tasks documentation recommends Cloud Run jobs for workloads exceeding its HTTP timeout.

{% capture diagram_code %}
flowchart TD
E["Document event"] --> R["Register revision and operation ID"]
R --> H["Acknowledge durable handoff"]
R --> J["Launch finite indexing job"]
J --> C{"Result committed?"}
C -- "Yes" --> P["Publish revision and completion"]
C -- "Unknown / interrupted" --> S["Read operation state and reconcile"]
S -- "Retry same operation" --> J
H --> Q["Client polls persisted status"]
P --> Q
{% endcapture %}
{% capture diagram_fallback %}
Register the document revision and operation durably before acknowledging the event. A separate job performs indexing and records completion. If execution is interrupted, reconcile the same operation before retrying. Clients read persisted status.
{% endcapture %}
{% include diagram.html title="Long work survives the delivery request" code=diagram_code fallback=diagram_fallback caption=true %}

## Processing follows the data and runtime

**Dataflow** runs Apache Beam batch and streaming pipelines. Event-time windows, watermarks, state and late-data handling belong to the processing design. It fits continuous telemetry aggregation or large ingestion transforms when managed Beam execution suits the team.

**Dataproc**, documented in the current Google Cloud guides as Managed Service for Apache Spark, runs Spark workloads with managed execution options. Existing PySpark jobs, libraries and physical-plan expertise can favor it. Moving SQL to Spark still requires checking partition pruning, shuffles, skew, file sizes and startup overhead.

**BigQuery** performs warehouse SQL close to stored data. If a transformation is primarily joins and aggregations over BigQuery tables, exporting the data to another engine adds transfer and operations that need a measured benefit. **dbt** versions SQL models, tests and dependencies; it uses the warehouse to execute those models.

For a small file with simple transformations, a bounded Python/Polars job may be sufficient. Distributed execution earns its extra setup and coordination cost when input size, parallelism or state requirements justify it.

## Choose the authoritative store and the serving index

Cloud Storage holds source objects and large artifacts. Cloud SQL provides relational transactions, constraints and indexed record access. BigQuery supports analytical scans, history and batch reporting. Firestore's document access model can suit application records, but query shapes, indexing and transaction requirements still determine whether it fits the workflow.

Vector search adds another access pattern. Warehouse vector search can serve analytical similarity queries near BigQuery data. PostgreSQL with pgvector can keep relational records and vectors together. A dedicated vector service can fit interactive search when its filtering, update visibility and latency meet the workload. Benchmark authorized queries and ongoing updates, including the source-to-index delay.

A vector index is derived data. Retain source IDs, revisions and permissions in authoritative storage so failed indexing, deletion and re-embedding can be reconciled.

## Scaling one service can overload the next

Suppose 40 Cloud Run instances each allow 20 concurrent requests. That configuration permits up to 800 in-flight handlers, before considering provider quotas, model capacity or database connection limits. Increasing instances may amplify throttling at a shared model endpoint. Size connection pools and concurrency against the downstream budget, then bound retries and queue growth.

Use [cloud compute selection]({{ '/infrastructure/scaling/cloud-workload-selection/' | relative_url }}) for graphics processing unit (GPU) and hosting choices, [cloud identity and network paths]({{ '/infrastructure/cloud/identity-network-data-path/' | relative_url }}) for permissions, and [stream acknowledgments and replay]({{ '/data-engineering/reliability/stream-delivery-replay/' | relative_url }}) for delivery semantics.
