---
title: "LLM observability"
nav_title: "Overview"
description: "Connect user latency to queues, token generation, KV-cache pressure, GPU state, and cost."
chapter: observability
order: 0
sequence: 500
level: "Chapter overview"
keywords:
  - LLM metrics
  - TTFT
  - TPOT
  - tokens per second
  - KV cache utilization
aliases:
  - inference observability
interview_queries:
  - what metrics do you monitor for LLM serving
references:
  - title: vLLM production metrics
    url: https://docs.vllm.ai/en/stable/usage/metrics/
  - title: vLLM benchmark latency metrics
    url: https://docs.vllm.ai/en/stable/benchmarking/cli/
---

Large language model (LLM) observability connects user-visible latency to queueing, token generation, key-value (KV) cache pressure, and graphics processing unit (GPU) state. A high GPU-utilization number by itself cannot tell you which of those paths is causing the delay.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/ai-engineering/observability/metrics/' | relative_url }}">What to measure in LLM serving</a><span>Separate user latency, serving pressure, GPU state, and economics.</span></li>
<li><a href="{{ '/ai-engineering/observability/debugging/' | relative_url }}">Debugging a slow or saturated LLM service</a><span>Use TTFT, queue time, prompt length, TPOT, KV cache, and startup state to narrow the bottleneck.</span></li>
</ul>

The useful path is short: start with the user-visible symptom, then follow the few signals that can explain it. Time to first token (TTFT) and time per output token (TPOT) split waiting/prefill from ongoing generation before lower-level metrics enter the investigation.

Serving telemetry explains runtime behavior. [Observability, explainability, traceability and auditability]({{ '/infrastructure/observability/observability-explainability-traceability-auditability/' | relative_url }}) extends the evidence to source revisions, model decisions, authorization and confirmed tool outcomes.
