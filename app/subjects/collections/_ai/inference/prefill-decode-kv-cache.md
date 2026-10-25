---
title: "Prefill, decode, and KV cache"
description: "Connect prompt processing and autoregressive decode to GPU memory, context length, and concurrency."
chapter: inference
math: true
order: 2
sequence: 102
level: Core
mermaid: true
keywords:
  - prefill
  - decode
  - KV cache
  - GPU memory
  - context length
  - concurrency
aliases:
  - key value cache
  - key-value cache
  - attention cache
tools:
  - vLLM
interview_queries:
  - what is KV cache
  - why does context length affect LLM concurrency
  - what is the difference between prefill and decode
references:
  - title: vLLM cache configuration
    url: https://docs.vllm.ai/en/stable/api/vllm/config/cache/
  - title: vLLM parallelism and scaling
    url: https://docs.vllm.ai/en/stable/serving/parallelism_scaling/
---

The key-value (KV) cache exists because recomputing attention state for every earlier token on every decode step would waste a large amount of work.

## Prefill builds the state generation will reuse

During prefill, the model processes the prompt and computes the attention keys and values required by later tokens. Those tensors are retained.

Then decode can reuse them:

{% capture diagram_code %}
flowchart LR
A["Prompt tokens"] --> B["Prefill"]
B --> C["KV cache"]
C --> D["Decode token 1"]
D --> C
C --> E["Decode token 2"]
E --> C
C --> F["..."]
{% endcapture %}
{% capture diagram_fallback %}
Prompt tokens → Prefill → KV cache → Decode token 1 → reuse cache → Decode token 2 → reuse cache → ...
{% endcapture %}
{% include diagram.html title="Prefill creates state that decode reuses" code=diagram_code fallback=diagram_fallback caption=true %}

The cache does not contain the original prose. It contains intermediate key/value tensors produced by attention layers for tokens already processed.

## GPU memory has more than model weights in it

Graphics processing unit (GPU) memory is roughly:

{% capture memory_budget %}
\begin{aligned}
M_{\mathrm{GPU}} &\approx M_{\mathrm{weights}}+M_{\mathrm{KV}}\\
&\quad+M_{\mathrm{runtime}}
\end{aligned}
{% endcapture %}
{% include math.html tex=memory_budget block=true %}

The exact breakdown changes by model, precision, inference engine, kernels, and configuration, but the consequence is stable: whatever memory the model weights consume is no longer available to hold active request state.

A model can therefore *fit* on a GPU while still leaving too little KV-cache capacity for useful concurrency.

vLLM reports both the number of tokens its GPU KV cache can hold and an estimated maximum concurrency for a configured request length. That is more actionable than asking only, “Does the checkpoint fit?”

## Context length is a capacity decision

Longer active sequences generally need more KV-cache state. If one replica has a fixed cache budget, increasing the typical sequence length reduces how many sequences can coexist.

Think of a simplified budget:

| Workload | Cache consumed per active request | Concurrent requests that fit |
|---|---:|---:|
| Short conversations | Lower | More |
| Long documents / conversations | Higher | Fewer |

This is why advertising a huge maximum context window does not mean every user can consume that context simultaneously at the same throughput.

The workload distribution matters. Capacity testing should use realistic prompt and generation lengths rather than one average request.

## Prefill and decode have different performance shapes

Prefill has a large amount of prompt work that can exploit parallel computation. Decode repeatedly performs smaller steps while reading model weights and attention state. The result is that an optimization helping prefill does not automatically improve decode to the same degree.

That distinction later matters for metrics:

- **Time to first token (TTFT)** includes waiting plus prompt processing before the first output arrives.
- **Time per output token (TPOT)** and inter-token latency say more about ongoing decode performance.

If TTFT is high while TPOT remains healthy, do not immediately conclude that “the GPU is slow.” The request may simply be waiting or processing a large prompt.

## KV cache is state, but not application session state

The cache is normally tied to active inference work inside a serving replica. Your application may separately persist chat messages, agent state, retrieved documents, or user sessions in databases or caches.

Do not conflate:

`conversation history stored by the application`

with:

`KV tensors retained by the inference runtime`.

The application can reconstruct a prompt on another replica. The KV cache is an optimization that may disappear when the request ends, is evicted, or traffic is routed elsewhere.

Next: [Continuous batching and request scheduling]({{ '/ai-engineering/inference/batching-scheduling/' | relative_url }}).
