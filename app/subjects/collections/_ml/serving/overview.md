---
title: "Model serving"
nav_title: "Overview"
description: "Deploy prediction pipelines, distribute artifacts and place models according to memory, traffic and isolation requirements."
chapter: serving
order: 0
sequence: 100
level: "Chapter overview"
keywords:
  - model serving
  - ML inference
  - LLM inference
aliases:
  - serving machine learning models
interview_queries:
  - how does serving an LLM differ from serving a traditional ML model
---

A trained model becomes useful to an application when callers can send inputs and receive predictions. Both conventional machine learning (ML) models and large language models (LLMs) need versioned artifacts, deployments, healthy replicas, and monitoring.

The request lifecycle changes the serving choices. A conventional prediction often finishes in one bounded pass. An autoregressive LLM processes a prompt, generates output over many steps, and keeps per-request attention state while it does so.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/ml/serving/model-serving-vs-llm-serving/' | relative_url }}">Traditional ML serving vs LLM serving</a><span>See which deployment fundamentals carry over and which constraints change for token generation, batching, graphics processing unit (GPU) memory, and scaling.</span></li>
<li><a href="{{ '/ml/serving/model-deployment-serving/' | relative_url }}">From trained model to prediction service</a><span>Choose execution mode, package fitted transforms, download pinned artifacts at runtime and release a ready service.</span></li>
<li><a href="{{ '/ml/serving/multi-model-serving/' | relative_url }}">Multi-model serving, grouping and memory capacity</a><span>Count loaded copies, choose isolation and budget resident plus request memory.</span></li>
</ul>

Continue into [LLM inference]({{ '/ai-engineering/inference/overview/' | relative_url }}) for the execution details or [Infrastructure & DevOps]({{ '/infrastructure/' | relative_url }}) for the shared deployment mechanics.
