---
title: "Pods, nodes, and Deployments"
description: "Follow desired workload replicas from a Deployment into Pods and onto cluster nodes."
chapter: kubernetes
order: 1
sequence: 201
level: Core
mermaid: true
keywords:
  - pod
  - node
  - deployment
  - ReplicaSet
  - kube scheduler
aliases:
  - pod vs node
  - deployment vs pod
tools:
  - Kubernetes
interview_queries:
  - what is a Kubernetes pod
  - pod vs deployment
  - what happens when a pod dies
references:
  - title: Kubernetes Pods
    url: https://kubernetes.io/docs/concepts/workloads/pods/
  - title: Kubernetes Deployments
    url: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
  - title: Kubernetes workload management
    url: https://kubernetes.io/docs/concepts/workloads/controllers/
---

A **node** is a machine in the cluster. A **Pod** is Kubernetes' smallest deployable compute unit. A **Deployment** is a controller-level object commonly used to keep a desired set of interchangeable Pods running.

{% capture diagram_code %}
flowchart TD
D["Deployment: replicas = 3"] --> P1["Pod A"]
D --> P2["Pod B"]
D --> P3["Pod C"]
P1 --> N1["Node 1"]
P2 --> N1
P3 --> N2["Node 2"]
{% endcapture %}
{% capture diagram_fallback %}
Deployment wants 3 replicas → Pods A/B/C → scheduler places Pods across Node 1 and Node 2.
{% endcapture %}
{% include diagram.html title="Deployment controls Pods; Pods run on nodes" code=diagram_code fallback=diagram_fallback caption=true %}

{% include figure.html id="kubernetes-components" %}

## Node: the resource pool

A node contributes central processing unit (CPU) capacity, memory, local storage, networking, and possibly GPUs or other devices.

The scheduler considers Pod resource requests and constraints when deciding which node can run it.

## Pod: the scheduling and lifecycle unit

A Pod contains one or more tightly coupled containers that share a network namespace and can share volumes.

Most application Pods contain one main application container, but a Pod can also include init containers or sidecars where the lifecycle relationship makes sense.

Kubernetes schedules Pods, not arbitrary individual containers.

## Deployment: desired replicated workload

A Deployment describes a desired Pod template and replica count.

If:

`desired replicas = 4`

but only three matching Pods exist, the control loop creates another.

If the Pod template changes, the Deployment coordinates replacement through ReplicaSets.

A Deployment continuously reconciles **desired state versus actual state**.

## What happens when a Pod dies?

For a Deployment-managed stateless workload, a controller creates replacement work. The replacement Pod is a new Pod; Kubernetes does not resurrect the old one as an immortal object.

If the failure came from a dead node, the new Pod may be scheduled elsewhere if suitable capacity exists.

## Controllers create work; the scheduler places it

The Deployment/controller decides that a Pod should exist.

The scheduler decides where an unscheduled Pod should run.

The kubelet on that node works with the container runtime to start and supervise the Pod's containers.

That separation becomes important during autoscaling:

```text
autoscaler increases desired replicas
→ controller creates Pods
→ scheduler tries to place them
→ node autoscaler may need to create machines
```

Next: [Services and networking]({{ '/infrastructure/kubernetes/services-networking/' | relative_url }}).
