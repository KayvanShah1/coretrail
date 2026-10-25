---
title: "End-to-end LLM serving architecture"
description: "Place every major serving component by the decision it owns, from public traffic to GPU execution and node provisioning."
chapter: production
order: 1
sequence: 401
level: Core
mermaid: true
keywords:
  - API gateway
  - model router
  - bounded queue
  - inference replica
  - Kubernetes scheduler
  - node autoscaler
aliases:
  - LLM system design
  - production serving architecture
tools:
  - Kubernetes
  - vLLM
interview_queries:
  - design an LLM serving architecture
  - what does each component in an LLM stack do
references:
  - title: vLLM documentation
    url: https://docs.vllm.ai/en/stable/
  - title: Kubernetes workloads
    url: https://kubernetes.io/docs/concepts/workloads/
  - title: Amazon EKS inference autoscaling
    url: https://docs.aws.amazon.com/eks/latest/userguide/ml-inference-autoscaling.html
---

A large language model (LLM) serving path is easier to reason about when every component owns a specific decision. The request path assigns traffic and execution, while the control path creates and maintains serving capacity.

{% capture diagram_code %}
flowchart TD
A["Client"] --> B["Load balancer / API gateway"]
B --> C["Model router"]
C --> D["Admission control / bounded queue"]
D --> E["Inference replica"]
E --> F["Inference scheduler + KV cache"]
F --> G["GPU(s)"]
H["Kubernetes"] -. "places / replaces replicas" .-> E
I["HPA / KEDA"] -. "desired replica count" .-> H
J["Node autoscaler"] -. "machine capacity" .-> H
K["Metrics / logs / traces"] -.-> E
K -.-> I
{% endcapture %}
{% capture diagram_fallback %}
Client → Load balancer/API gateway → Model router → Admission control/bounded queue → Inference replica → inference scheduler/KV cache → GPU(s). Kubernetes places/replaces replicas; HPA/KEDA changes desired replicas; node autoscaling supplies machines; observability feeds operations and scaling.
{% endcapture %}
{% include diagram.html title="The serving data path and the infrastructure control path" code=diagram_code fallback=diagram_fallback caption=true %}

## Data path: where the request goes

**Load balancer / API gateway:** terminates external traffic and commonly owns authentication, quotas, request validation, and rate limits.

**Model router:** chooses a model, version, region, or serving replica. It may be simple or inference-aware.

**Admission control / bounded queue:** prevents unlimited work from entering a finite serving system.

**Inference replica:** owns the model execution environment.

**Inference scheduler:** decides how active sequences share execution and cache capacity.

**Graphics processing unit (GPU):** performs the tensor computation.

## Control path: how serving capacity exists

**Kubernetes:** keeps the declared workloads running and places Pods on suitable nodes.

**Workload autoscaler:** changes the desired number of serving replicas from metrics or events. The Horizontal Pod Autoscaler (HPA) and Kubernetes Event-driven Autoscaling (KEDA) are common Kubernetes examples.

**Node autoscaler:** obtains or removes machines when the current cluster cannot place those replicas. Karpenter and cluster autoscalers are examples.

**Observability:** provides the evidence used for scaling, SLOs, and debugging.

## The “who does what?” map

| Layer | Main responsibility | Example |
|---|---|---|
| Container image | Package the serving software environment | Docker / OCI image |
| Workload orchestrator | Maintain, place, and roll workload replicas | Kubernetes |
| Service/gateway | Expose traffic, enforce policy, and route requests | API gateway / Service |
| Workload autoscaler | Change desired replica count | HPA / KEDA |
| Node autoscaler | Change machine capacity | Karpenter / cluster autoscaler |
| Inference engine | Schedule and execute LLM inference | vLLM / SGLang |
| Telemetry | Expose and collect evidence for operations and scaling | metrics / logs / traces |

Higher-level serving frameworks and general inference servers can compose around these layers. The [inference engine page]({{ '/ai-engineering/serving/inference-engines/' | relative_url }}) keeps those tool boundaries in one place instead of repeating the ecosystem here.

## Same fundamentals, different bottleneck

A normal backend may saturate on central processing unit (CPU) capacity, database connections, or I/O.

An LLM service can saturate on:

```text
GPU compute
GPU memory / key-value (KV) cache
inter-GPU communication
request queue
model startup capacity
token throughput
```

The architecture fundamentals survive. The useful signals and cost of a replica change.

Next: [Rate limits, concurrency, and backpressure]({{ '/ai-engineering/production/traffic-backpressure/' | relative_url }}).
