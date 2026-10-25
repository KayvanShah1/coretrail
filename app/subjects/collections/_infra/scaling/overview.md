---
title: "Scaling"
nav_title: "Overview"
description: "Connect workload replica demand to the machine capacity required to place and run those replicas."
chapter: scaling
order: 0
sequence: 300
level: "Chapter overview"
keywords:
  - horizontal scaling
  - HPA
  - KEDA
  - cluster autoscaler
  - Karpenter
aliases:
  - Kubernetes autoscaling
tools:
  - HPA
  - KEDA
  - Karpenter
interview_queries:
  - HPA vs cluster autoscaler
  - how does Kubernetes autoscaling work
references:
  - title: Kubernetes Horizontal Pod Autoscaler
    url: https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/
  - title: Karpenter documentation
    url: https://karpenter.sh/docs/
---

Kubernetes autoscaling has two control loops that can move at different times.

| Control loop | Changes |
| --- | --- |
| Workload scaling | Desired replica count |
| Node scaling | Machine capacity available to place those replicas |

The workload loop can ask for more Pods even when the cluster has nowhere to place them. Those Pods remain Pending until suitable machine capacity appears.

The Horizontal Pod Autoscaler (HPA) changes workload replica demand from metrics. Kubernetes Event-driven Autoscaling (KEDA) can feed external or event-driven demand into that loop. A node autoscaler changes the cluster's machine capacity; Karpenter is one implementation.

That sequence matters during incidents: a rising replica target does not create capacity until the scheduler can place the new Pods.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/infrastructure/scaling/workload-node-autoscaling/' | relative_url }}">Workload versus node autoscaling</a><span>Place HPA, KEDA, Kubernetes scheduling, and Karpenter in one control flow.</span></li>
<li><a href="{{ '/infrastructure/scaling/cloud-workload-selection/' | relative_url }}">Cloud Run, GKE, Vertex AI and EKS</a><span>Choose compute from workload lifecycle, control requirements and accelerator limits.</span></li>
</ul>
