---
title: "Cloud Run, GKE, Vertex AI and EKS"
description: "Select managed compute and model-serving services by request shape, hardware requirements, state and operational control."
chapter: scaling
order: 2
sequence: 302
level: Core
keywords: [Cloud Run, GKE, Vertex AI, EKS, Fargate, GPU, model deployment]
interview_queries: [Cloud Run vs GKE, where should an AI agent run, can EKS Fargate run GPUs]
references:
  - title: Cloud Run GPU services
    url: https://cloud.google.com/run/docs/configuring/services/gpu
  - title: Amazon EKS on Fargate
    url: https://docs.aws.amazon.com/eks/latest/userguide/fargate.html
---

A model endpoint, a request-handling agent and an ingestion worker have different request lifetimes and resource needs. Service selection follows request lifetime, memory footprint, accelerator needs and the level of operational control the team is prepared to maintain.

Google Kubernetes Engine (GKE) and Amazon Elastic Kubernetes Service (EKS) provide managed Kubernetes environments. Their workload controls can matter when an application needs specialized scheduling or cluster policies.

| Workload | Starting choice | Reason to consider another option |
|---|---|---|
| Stateless FastAPI agent using a managed model | Cloud Run | Complex service networking or custom cluster policies |
| Managed foundation-model inference | Vertex AI | Need model weights/runtime not supported by managed offering |
| Custom graphics processing unit (GPU) model server | GKE GPU nodes or configured Cloud Run GPU service | Multi-node topology, specialized scheduling or fine-grained GPU control |
| Streaming ETL | Dataflow | Workload needs different runtime or operational model |
| Cluster-scheduled central processing unit (CPU) jobs on AWS | EKS Fargate | GPU, privileged containers or DaemonSets needed |
| Long-running GPU inference on AWS | GPU-capable EC2/EKS nodes or managed inference | Requirement for a different scaling and operational model |

Google Cloud Run supports selected GPU configurations. Compare GPU availability, cold start, model size, scaling limits and cost with a Kubernetes deployment.

Amazon EKS Fargate does not provide GPUs. A CPU data-processing job on Fargate can still submit predictions to a separate model endpoint that owns GPU inference.

## Request path and state

An agent backend can be stateless from the container's perspective while its workflow persists in a database. Cloud SQL can retain transactional state, Cloud Storage can hold source documents and artifacts, Pub/Sub can decouple indexing tasks, and Vertex AI or another inference endpoint can generate model outputs.

Authentication should propagate user identity to retrieval and tool services. IAM controls service-to-service permission, while application authorization decides which customer records a user may access. A shared search index must enforce document access rather than relying on the final response model.

## What changes as traffic grows?

Model inference saturates differently from an ordinary HTTP service. A rise in backend replica count does not increase the capacity of a shared model endpoint. Monitor queueing, input and output token distributions, GPU memory and third-party API quotas.

If a service waits on a slow provider, a bounded queue and concurrency limit prevent unlimited in-flight requests. Scheduled or long-running work can move to durable job workers, with retries and idempotent side effects.

Operational cost depends on idle GPU headroom, weight-loading time, utilization and per-tenant demand. The cheapest per-token engine at full utilization may be expensive at low traffic because the GPUs remain provisioned.

See [production serving architecture]({{ '/ai-engineering/production/architecture/' | relative_url }}) for the complete request path.
