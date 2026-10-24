---
layout: subject
title: AI Engineering
subject: ai-engineering
permalink: /ai-engineering/
description: LLM inference, serving, deployment, observability, and production systems.
mermaid: true
keywords:
  - LLM inference
  - LLM serving
  - LLM deployment
  - LLM observability
  - production inference
aliases:
  - AI engineering handbook
---

## Start from what the model is actually doing

The Artificial Intelligence (AI) Engineering trail covers large language model (LLM) serving, retrieval, tool-using agents and evaluation. A hosted model can hide most of that machinery until latency, capacity, cost, or a production failure makes the execution path relevant.

The serving chapters start with one model request, then add deployment, production traffic, and observability. The next chapters follow retrieved evidence and tool calls through a user-facing application.

{% capture diagram_code %}
flowchart LR
A["Prompt"] --> B["Inference"]
B --> C["Serving"]
C --> D["Deployment"]
D --> E["Production traffic"]
E --> F["Observability"]
{% endcapture %}
{% capture diagram_fallback %}
Prompt → Inference → Serving → Deployment → Production traffic → Observability
{% endcapture %}
{% include diagram.html title="From a model call to a production service" code=diagram_code fallback=diagram_fallback caption=true %}

Each component should answer a concrete question: where the request goes, where it can wait, how inference runs, how capacity changes, and which signals explain a slowdown.

## Follow the serving path

<ul class="topic-list">
<li><a href="{{ '/ai-engineering/inference/overview/' | relative_url }}">LLM inference</a><span>Prefill, decode, key-value (KV) cache, batching, and graphics processing unit (GPU) work behind token generation.</span></li>
<li><a href="{{ '/ai-engineering/serving/overview/' | relative_url }}">LLM serving</a><span>Inference engines, replicas, parallelism, routing, and concurrent users.</span></li>
<li><a href="{{ '/ai-engineering/deployment/overview/' | relative_url }}">Deploying LLMs</a><span>Artifacts, containers, model weights, GPU startup, readiness, and rollouts.</span></li>
<li><a href="{{ '/ai-engineering/production/overview/' | relative_url }}">Production LLM systems</a><span>Gateways, queues, backpressure, autoscaling, cold starts, capacity, and failures.</span></li>
<li><a href="{{ '/ai-engineering/observability/overview/' | relative_url }}">LLM observability</a><span>Time to first token (TTFT), time per output token (TPOT), queue pressure, KV-cache utilization, GPU signals, and cost.</span></li>
<li><a href="{{ '/ai-engineering/retrieval/overview/' | relative_url }}">RAG & retrieval</a><span>Parsing, embeddings, hybrid search, reranking, context selection, and scale.</span></li>
<li><a href="{{ '/ai-engineering/agents/overview/' | relative_url }}">Agents & tools</a><span>Typed tool contracts, execution state, authorization and retries.</span></li>
<li><a href="{{ '/ai-engineering/evaluation/overview/' | relative_url }}">AI evaluation</a><span>Retrieval diagnostics, groundedness, trajectories, latency and cost.</span></li>
</ul>

## Keep the boundary with general infrastructure clear

Docker, Kubernetes, Services, probes, the Horizontal Pod Autoscaler (HPA), Kubernetes Event-driven Autoscaling (KEDA), and node autoscaling are not LLM concepts. Their mechanics live under [Infrastructure & DevOps]({{ '/infrastructure/' | relative_url }}).

The AI pages use those mechanisms where the LLM changes the decision: a replica may need several GPUs, model startup can require moving tens of gigabytes before readiness, and GPU utilization alone may not tell you whether another request will meet its latency target.
