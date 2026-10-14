---
title: "Kubernetes"
nav_title: "Overview"
description: "Use Pods, nodes, Deployments, Services, storage, and probes as separate abstractions instead of treating Kubernetes as one box."
chapter: kubernetes
order: 0
sequence: 200
level: "Chapter overview"
keywords:
  - Kubernetes
  - pod
  - deployment
  - service
  - scheduler
aliases:
  - k8s
tools:
  - Kubernetes
interview_queries:
  - what does Kubernetes do
  - pod vs deployment vs node
references:
  - title: Kubernetes workloads
    url: https://kubernetes.io/docs/concepts/workloads/
---

Kubernetes is a desired-state orchestration system. You declare workloads and their constraints; controllers and schedulers try to make the cluster match that state.

Do not use “Kubernetes” as the explanation for every deployment behavior. Name the object or controller that owns the decision.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/infrastructure/kubernetes/pods-nodes-deployments/' | relative_url }}">Pods, nodes, and Deployments</a><span>Separate the machine, the smallest deployable unit, and the controller maintaining replicas.</span></li>
<li><a href="{{ '/infrastructure/kubernetes/services-networking/' | relative_url }}">Services and networking</a><span>Give changing Pods a stable way to be reached.</span></li>
<li><a href="{{ '/infrastructure/kubernetes/storage-init-containers/' | relative_url }}">Storage and init containers</a><span>Prepare shared data before the main application starts.</span></li>
<li><a href="{{ '/infrastructure/kubernetes/probes-rollouts/' | relative_url }}">Startup, readiness, liveness, and rollouts</a><span>Keep initialization, traffic eligibility, restart decisions, and version replacement separate.</span></li>
<li><a href="{{ '/infrastructure/kubernetes/gpu-scheduling-debugging/' | relative_url }}">GPU scheduling, Pending Pods and inference incidents</a><span>Read scheduler symptoms, resource requests, model startup and GPU metrics.</span></li>
</ul>
