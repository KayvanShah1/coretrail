---
title: "Production LLM systems"
nav_title: "Overview"
description: "Connect gateways, routing, queues, replicas, autoscaling, cold starts, and failures into one serving architecture."
chapter: production
order: 0
sequence: 400
level: "Chapter overview"
keywords:
  - production LLM
  - serving architecture
  - autoscaling
  - backpressure
  - capacity planning
aliases:
  - LLMOps serving
  - production inference
interview_queries:
  - design a production LLM system
  - how do you scale LLM inference
references:
  - title: Amazon EKS inference autoscaling
    url: https://docs.aws.amazon.com/eks/latest/userguide/ml-inference-autoscaling.html
---

Large language model (LLM) serving still uses familiar distributed-systems fundamentals: load balancing, replication, bounded queues, backpressure, health checks, rollouts, capacity planning, observability, and failure domains.

What changes is the resource profile. Model replicas are large, graphics processing unit (GPU) / accelerator-bound, stateful during generation, and expensive to start.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/ai-engineering/production/architecture/' | relative_url }}">End-to-end LLM serving architecture</a><span>Place the gateway, router, queue, inference engine, Kubernetes, and GPU node scaler by responsibility.</span></li>
<li><a href="{{ '/ai-engineering/production/traffic-backpressure/' | relative_url }}">Rate limits, concurrency, and backpressure</a><span>Separate customer policy from actual serving capacity and overload control.</span></li>
<li><a href="{{ '/ai-engineering/production/autoscaling/' | relative_url }}">Autoscaling LLM inference</a><span>Separate replica scaling from GPU-node provisioning and choose useful demand signals.</span></li>
<li><a href="{{ '/ai-engineering/production/cold-starts-capacity/' | relative_url }}">Cold starts and warm capacity</a><span>See why model loading changes autoscaling and capacity planning.</span></li>
<li><a href="{{ '/ai-engineering/production/failures/' | relative_url }}">Failures and recovery</a><span>Define the real failure unit when a replica spans several GPUs or machines.</span></li>
<li><a href="{{ '/ai-engineering/production/tradeoffs/' | relative_url }}">Serving trade-offs</a><span>Connect latency, throughput, quality, context length, and cost.</span></li>
<li><a href="{{ '/ai-engineering/production/stack-tradeoffs/' | relative_url }}">AI platform tool choices and replacement triggers</a><span>Compare search, inference, orchestration and storage alternatives by operating constraint.</span></li>
</ul>
