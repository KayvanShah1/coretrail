---
layout: subject
title: Infrastructure & DevOps
subject: infrastructure
permalink: /infrastructure/
description: Containers, Kubernetes, deployment, scaling, and operating production systems.
mermaid: true
keywords:
  - Docker
  - Kubernetes
  - autoscaling
  - observability
aliases:
  - DevOps
  - infrastructure
---

## Follow the workload, not the tool list

Infrastructure becomes easier when each component answers one operational question.

{% capture diagram_code %}
flowchart TB
S["Source + dependencies"] --> B["Build immutable image"]
B --> R["Image registry"]
K["Kubernetes Deployment"] --> P["Scheduler places Pod"]
N["Node pool"] --> P
P --> C["Container runtime on node"]
R -. "pull image" .-> C
C --> V["Ready Pod"]
L["Service"] --> V
H["HPA / KEDA"] -. "replicas" .-> K
F["Node autoscaler"] -. "machines" .-> N
O["Metrics, logs and traces"] -.-> H
O -.-> F
{% endcapture %}
{% capture diagram_fallback %}
Source code builds an immutable image stored in a registry. Kubernetes schedules Pods on nodes whose runtimes pull the image; Services send requests to ready Pods. Workload autoscalers change replica demand, node autoscalers supply machines, and telemetry informs those decisions.
{% endcapture %}
{% include diagram.html title="Image distribution, Pod placement and autoscaling controls" code=diagram_code fallback=diagram_fallback caption=true %}

The pages here own the reusable mechanics. Artificial Intelligence (AI) Engineering links back when a large language model (LLM) changes the resource profile, startup path, or scaling signal.

## Start with the layers

<ul class="topic-list">
<li><a href="{{ '/infrastructure/containers/overview/' | relative_url }}">Containers</a><span>Images, registries, runtimes, and graphics processing unit (GPU) access.</span></li>
<li><a href="{{ '/infrastructure/kubernetes/overview/' | relative_url }}">Kubernetes</a><span>Pods, nodes, Deployments, Services, storage, init containers, and probes.</span></li>
<li><a href="{{ '/infrastructure/scaling/overview/' | relative_url }}">Scaling</a><span>Workload replicas versus machine capacity, with the Horizontal Pod Autoscaler (HPA), Kubernetes Event-driven Autoscaling (KEDA), and node autoscaling.</span></li>
<li><a href="{{ '/infrastructure/observability/overview/' | relative_url }}">Operations & observability</a><span>Metrics, logs, traces, health, and the evidence used during incidents.</span></li>
<li><a href="{{ '/infrastructure/cloud/overview/' | relative_url }}">Cloud architecture, IAM & cost</a><span>Service identities, secure request paths, managed data services and cost trade-offs.</span></li>
</ul>
