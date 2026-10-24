---
title: "Cloud identity, network paths and service design"
description: "Map IAM identities, private connectivity, messaging guarantees and data services to an AI or analytics application's request paths."
chapter: cloud
order: 1
sequence: 501
level: Intermediate
mermaid: true
keywords: [GCP IAM, workload identity, VPC, private services, PubSub, Cloud Run, BigQuery, Cloud SQL, S3, KMS, EKS]
aliases: [GCP services architecture, cloud security and cost]
interview_queries: [which GCP services power a RAG application, why use workload identity, how to secure service-to-service calls]
references:
  - title: Google Cloud service account best practices
    url: https://cloud.google.com/iam/docs/best-practices-for-managing-service-account-keys
  - title: Google Cloud workload identity federation
    url: https://cloud.google.com/iam/docs/workload-identity-federation
---
A cloud application commonly mixes request-serving workloads, queued processing, transactional state, object storage and analytics. Selecting one managed service for every task can make the system harder to scale or secure. Each component should have a clearly bounded responsibility and a measurable failure condition.

## A retrieval application's control and data paths

{% capture diagram_code %}
flowchart TD
U["Client"] --> G["HTTPS load balancer / API gateway"]
G --> A["Stateless API or agent service"]
A --> D["Cloud SQL: runs, permissions, transactions"]
A --> V["Search index: lexical + vector retrieval"]
A --> M["Managed / self-hosted model endpoint"]
O["Object storage: versioned source files"] --> P["Pub/Sub change events"]
P --> W["Indexer workers / Dataflow"]
W --> V
W --> B["BigQuery: analytical logs and batch marts"]
A -. "structured traces" .-> B
IAM["Workload identities + scoped IAM roles"] -.-> A
IAM -.-> W
{% endcapture %}
{% capture diagram_fallback %}
Client → API gateway → stateless agent. Agent reads transactional state from Cloud SQL, documents through a vector/lexical search service and model output from an inference endpoint. Object storage publishes changes through Pub/Sub to indexing workers. BigQuery supports analytics. Each service has its own scoped workload identity.
{% endcapture %}
{% include diagram.html title="A cloud RAG application separates request state, indexing and analytics" code=diagram_code fallback=diagram_fallback caption=true %}

Cloud Run is convenient for stateless HTTP workloads and event handlers, including supported GPU configurations; Google Kubernetes Engine (GKE) provides deeper scheduling and cluster control. Vertex AI exposes managed ML and model-hosting capabilities. Cloud Storage stores large versioned objects, Cloud SQL provides transactional records, BigQuery handles analytical scans, and Pub/Sub decouples producers and consumers. Dataflow processes batch and streaming pipelines using Apache Beam.

AWS has comparable building blocks with different configuration and pricing: S3 for objects, RDS/Aurora for transactions, EKS/ECS for containers, SNS/SQS/Kinesis for events, and SageMaker/Bedrock for managed ML or model access. A service-to-service migration still requires examining semantics; mapping product names does not preserve acknowledgement, autoscaling or permission behavior.

## Identity is attached to workloads

Human credentials and long-lived keys copied into images create unnecessary exposure. Managed service identities and workload identity federation allow code to request short-lived credentials under assigned policies. Give the ingestion worker read permission to the relevant source bucket and write permission only to the designated staging/index resources. A model endpoint generally should not acquire administrator privileges over every database.

Identity and authorization solve separate questions: the cloud IAM role establishes which services a process may access; application checks determine which tenant, row or document a specific user is authorized to see. A system-wide search index must apply tenant/document permissions at retrieval time. Hiding restricted results only in the final LLM answer is insufficient.

## Network and secrets

A virtual private cloud (VPC) provides network isolation and routing rules. Private endpoints and restricted egress reduce public exposure, though networking rules alone do not replace authenticated service calls. HTTPS/TLS protects communication in transit; encrypted storage and key management help at rest. Store secrets in a managed secret store, rotate them and avoid logging tokens or full sensitive tool payloads.

Instrument the full path from gateway to retrieval to model call. A healthy backend container does not mean the retrieval service, warehouse or model provider is available. Bound concurrency and timeouts so a slow dependency cannot accumulate unlimited requests.

## Cost follows the access pattern

| Requirement | What drives cost | Common avoidable problem |
|---|---|---|
| BigQuery analytics | Bytes processed or reserved capacity, storage | Repeated full-table scans and missed partition pruning |
| Search index | Vector payload, memory, replicas, indexing | Over-wide vectors and unnecessary chunk overlap |
| LLM endpoint | GPU-hours or billed tokens | Idle provisioned capacity or excessive retrieved context |
| Object storage | Capacity, requests, network transfer | Rewriting entire corpora on every minor update |
| Pub/Sub workers | Message volume, processing and downstream writes | Poison-message retries and unbounded backlog |
| Cross-region paths | Transfer, latency and consistency | Unnecessary region hops in the hot request path |

Choose regions, network paths and storage according to data-residency and latency requirements. Monitor end-to-end p95, error budget, backlog age, index freshness and cost per successful user action alongside cloud-provider resource metrics.

The underlying workload decisions are covered in [cloud compute choices]({{ '/infrastructure/scaling/cloud-workload-selection/' | relative_url }}) and [stream retry semantics]({{ '/data-engineering/reliability/stream-delivery-replay/' | relative_url }}).
