---
title: "LLM inference"
nav_title: "Overview"
description: "Follow a prompt through prefill, decode, memory, batching, and token generation before adding deployment infrastructure."
chapter: inference
order: 0
sequence: 100
level: "Chapter overview"
keywords:
  - LLM inference
  - token generation
  - autoregressive inference
aliases:
  - language model inference
interview_queries:
  - how does LLM inference work
  - why is LLM serving expensive
references:
  - title: vLLM documentation
    url: https://docs.vllm.ai/en/stable/
---

## Begin below the API

A request to a large language model (LLM) endpoint eventually becomes tensor work on a graphics processing unit (GPU) or another accelerator. Before thinking about Kubernetes or autoscaling, understand what one replica is trying to do.

The serving problems in this chapter follow directly from four facts:

1. the prompt is processed before generation begins;
2. output is generated autoregressively rather than all at once;
3. active requests keep attention state in a key-value (KV) cache;
4. GPUs become efficient when useful work from several requests can be scheduled together.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/ai-engineering/inference/how-inference-works/' | relative_url }}">How LLM inference actually works</a><span>Separate prompt processing from autoregressive token generation.</span></li>
<li><a href="{{ '/ai-engineering/inference/prefill-decode-kv-cache/' | relative_url }}">Prefill, decode, and KV cache</a><span>See why context length changes latency, memory pressure, and concurrency.</span></li>
<li><a href="{{ '/ai-engineering/inference/batching-scheduling/' | relative_url }}">Continuous batching and request scheduling</a><span>Understand how many active sequences share expensive GPU execution.</span></li>
<li><a href="{{ '/ai-engineering/inference/efficient-inference/' | relative_url }}">Making inference faster and cheaper</a><span>Place quantization, prefix caching, PagedAttention, and speculative decoding against the bottleneck they address.</span></li>
<li><a href="{{ '/ai-engineering/inference/transformers-embeddings-adaptation/' | relative_url }}">Transformer attention, embeddings and fine-tuning</a><span>Recall scaled attention, contrastive objectives and parameter-efficient adaptation.</span></li>
<li><a href="{{ '/ai-engineering/inference/tokenizers-decoding-sampling/' | relative_url }}">Tokenization, logits, sampling and generation behavior</a><span>BPE, subword tokens, softmax temperature, top-p/top-k and decoding cost.</span></li>
<li><a href="{{ '/ai-engineering/inference/nlp-representations-preprocessing/' | relative_url }}">NLP preprocessing, representations and entity resolution</a><span>Trace normalization, sparse features, sentence pooling and canonical record identity.</span></li>
</ul>

Compute, memory, waiting, communication and model quality create different symptoms. Identify which one constrains the request before choosing an optimization.
