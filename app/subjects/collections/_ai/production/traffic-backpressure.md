---
title: "Rate limits, concurrency, and backpressure"
description: "Connect tenant quotas, active inference limits, waiting queues, and overload protection in a large-language-model service."
chapter: production
order: 2
sequence: 402
level: Core
mermaid: true
keywords:
  - rate limiting
  - RPM
  - TPM
  - concurrency limit
  - bounded queue
  - backpressure
  - admission control
aliases:
  - token rate limit
  - overload protection
interview_queries:
  - how do you rate limit an LLM API
  - rate limit vs concurrency limit
  - how do you prevent an LLM service from overloading
references:
  - title: NVIDIA Triton dynamic batching and queue policy
    url: https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/batcher.html
---

These controls answer different questions.

## Rate limit: how much may a caller submit?

A gateway may enforce:

```text
requests per minute
input tokens per minute
output tokens per minute
daily spend / quota
maximum context length
```

Requests per second alone is weak for large language models (LLMs) because a 20-token prompt and a 100,000-token prompt do not create the same work.

Token-aware quotas are partly cost control and partly fairness between tenants.

## Concurrency limit: how much may execute at once?

A serving replica has finite key-value (KV) cache and scheduling capacity.

Even if a customer is within its minute-level quota, letting thousands of its requests become active simultaneously can crowd out other traffic or exhaust cache memory.

Concurrency limits protect the actual serving resource.

## Queue: where does admitted work wait?

A bounded queue can absorb a short burst when demand briefly exceeds immediate capacity.

The word **bounded** matters.

An unbounded queue can turn overload into enormous time to first token (TTFT). Clients then timeout, retry, and create even more work.

## Backpressure: what happens when the system is full?

When serving capacity is exhausted, the system needs a deliberate response:

- reject with a retryable status such as 429;
- shed lower-priority traffic;
- route elsewhere;
- degrade to a smaller model;
- cap output/context;
- wait only within a known queue budget.

Backpressure is preferable to pretending every request can be served while latency grows without bound.

## The overload loop to recognize

{% capture diagram_code %}
flowchart TD
A["Arrival rate exceeds service capacity"] --> Q["Bounded queue starts filling"]
Q --> T["Time to first token rises"]
T --> R["Client timeout and retries"]
R --> A
Q --> G{"Admission / load shedding"}
G -- "Reject or defer" --> B["Protect in-flight requests"]
G -- "Accept" --> I["Inference scheduler"]
I --> C["Completed responses"]
{% endcapture %}
{% capture diagram_fallback %}
Arrival rate above service capacity grows queue time. Delayed responses induce retries that add demand. Admission controls protect in-flight work by rejecting or deferring excess requests.
{% endcapture %}
{% include diagram.html title="Retry amplification and the admission-control feedback loop" code=diagram_code fallback=diagram_fallback caption=true %}

Retries need backoff and jitter, and the server needs admission limits. Otherwise a recoverable traffic spike can become a self-sustaining retry storm.

## Customer policy is decided before engine scheduling

The inference scheduler decides which already-admitted sequences execute.

The gateway and admission layer decide whether work should enter the serving system in the first place.

This keeps fairness and product quotas at the admission edge while the model runtime concentrates on admitted inference work.

Next: [Autoscaling LLM inference]({{ '/ai-engineering/production/autoscaling/' | relative_url }}).
