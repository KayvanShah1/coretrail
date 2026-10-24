---
title: "Autoscaling LLM inference"
description: "Separate model-replica scaling from GPU-node provisioning and choose queue, latency, and KV-cache signals instead of relying on GPU utilization alone."
chapter: production
order: 3
sequence: 403
level: Core
mermaid: true
keywords:
  - autoscaling
  - queue depth
  - waiting requests
  - TTFT
  - KV cache utilization
  - GPU scaling
  - replica scaling
aliases:
  - LLM autoscaling
  - inference autoscaling
tools:
  - HPA
  - KEDA
  - Karpenter
  - Kubernetes
interview_queries:
  - how do you autoscale an LLM
  - what metrics should LLM autoscaling use
  - HPA vs Karpenter for GPU inference
references:
  - title: Amazon EKS inference autoscaling
    url: https://docs.aws.amazon.com/eks/latest/userguide/ml-inference-autoscaling.html
  - title: Kubernetes Horizontal Pod Autoscaler
    url: https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/
  - title: KEDA scaling deployments
    url: https://keda.sh/docs/2.21/concepts/scaling-deployments/
  - title: Karpenter documentation
    url: https://karpenter.sh/docs/
---

Large language model (LLM) autoscaling has two different control loops.

{% capture diagram_code %}
flowchart TD
A["Queue / latency pressure"] --> B["Workload autoscaler<br/>(for example HPA / KEDA)"]
B --> C["Desired model replicas increase"]
C --> D["Kubernetes creates Pod"]
D --> E{"GPU node has room?"}
E -- "Yes" --> F["Schedule Pod"]
E -- "No" --> G["Pod Pending"]
G --> H["Node autoscaler<br/>(for example Karpenter)"]
H --> I["Provision GPU node"]
I --> F
F --> J["Load model + become ready"]
J --> K["New serving capacity"]
{% endcapture %}
{% capture diagram_fallback %}
Queue/latency pressure → HPA/KEDA → desired replicas increase → Kubernetes creates Pod. If no GPU node has room, Pod stays Pending → node autoscaler provisions GPU node → Pod schedules → model loads/readiness → new serving capacity.
{% endcapture %}
{% include diagram.html title="Workload scaling and node scaling are separate" code=diagram_code fallback=diagram_fallback caption=true %}

## Replica demand and placement

The Horizontal Pod Autoscaler (HPA) and Kubernetes Event-driven Autoscaling (KEDA) adjust workload demand; a node autoscaler supplies suitable machines. The [infrastructure scaling reference]({{ '/infrastructure/scaling/workload-node-autoscaling/' | relative_url }}) explains those control loops and scheduling constraints.

For an illustrative replica using two graphics processing units (GPUs), six desired replicas require twelve allocatable GPUs with the required placement. If the cluster can place only four replicas, the remaining two stay Pending. Their future capacity cannot satisfy the current queue, and newly provisioned replicas still need model startup.

## Why GPU utilization alone can mislead

High GPU utilization can be a sign that an inference engine is doing its job well. Efficient batching may keep an accelerator busy across both healthy and overloaded traffic levels.

Amazon Web Services (AWS) Elastic Kubernetes Service (EKS) inference guidance recommends queue depth as a strong leading signal, with 95th-percentile (p95) latency, time to first token (TTFT), and key-value (KV) cache utilization as additional evidence.

Scaling should react to **unserved demand or service-level objective (SLO) pressure**, not only to a busy resource.

## Useful signals

| Signal | What it tells you |
|---|---|
| Waiting requests / queue depth | Demand is exceeding current immediate service capacity |
| TTFT / request latency | Users are feeling queue or prefill pressure |
| KV-cache utilization | Active request state is approaching memory capacity |
| Tokens/sec | How much useful generation work the fleet is completing |
| GPU utilization | Hardware is busy, but not necessarily whether more capacity is needed |

## Thresholds come from load testing

Do not pick “queue > 10” because it sounds reasonable.

Load test one replica with realistic prompt/output distributions, increase offered load, and observe where TTFT, time per output token (TPOT), errors, and queue depth stop meeting the target.

That gives you a capacity curve and an evidence-based scaling threshold.

Autoscaling still has a hard limitation: a new GPU replica is not useful until it exists and has loaded the model.

Continue to [Cold starts and warm capacity]({{ '/ai-engineering/production/cold-starts-capacity/' | relative_url }}).
