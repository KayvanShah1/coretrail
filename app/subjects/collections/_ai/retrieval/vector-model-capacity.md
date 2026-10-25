---
title: "Embedding dimensions, corpus size and retrieval cost"
description: "Estimate raw vector storage, ANN memory and indexing cost before assuming larger representations will improve search."
chapter: retrieval
order: 6
sequence: 606
level: Intermediate
math: true
keywords: [embedding dimension, vector storage, model size, index memory, recall latency]
aliases: [embedding vector cost, embedding dimensionality]
interview_queries: [does higher embedding dimension improve accuracy, how much memory for ten million vectors]
---
Three quantities affect a retrieval system in different ways: encoder parameter count, embedding dimensionality, and the number of indexed vectors. A larger encoder may require more inference compute without producing wider vectors. A wider representation increases storage and comparison work without guaranteeing better domain relevance. More chunks increase vector count even when the encoder stays unchanged.

## Estimate the raw vector payload

{% include math.html tex="M_{\mathrm{raw}}=N\times d\times b" block=true %}

Here `N` is the number of stored vectors, `d` the number of components per vector and `b` the bytes per component. With 32-bit floating-point storage, 10 million 768-dimensional vectors require approximately 30.72 decimal gigabytes before index structures, metadata, replicas and caches.

| Dimensions | 1 million vectors | 10 million vectors |
|---|---|---|
| 384 | 1.54 GB | 15.36 GB |
| 768 | 3.07 GB | 30.72 GB |
| 1,536 | 6.14 GB | 61.44 GB |
| 3,072 | 12.29 GB | 122.88 GB |

A flat exact similarity scan performs work proportional to {% include math.html tex="N\times d" %}. Hierarchical Navigable Small World (HNSW) adds graph memory and changes the candidate-search cost. Inverted File (IVF) and product quantization (PQ) offer different memory/recall/latency trade-offs. Search-time configuration and dataset distribution affect actual performance.

## Chunking can dominate the footprint

Reducing average chunks from 1,000 to 250 tokens can approximately quadruple vector count for fixed text volume before accounting for overlap. Smaller chunks may improve topical precision while losing relationships across sentences or tables. More overlap creates additional embeddings and can make top-k results redundant.

Measure answer correctness, sufficient-evidence coverage, index memory, incremental refresh time and query latency together. A large vector index that retrieves fragmented evidence poorly is an expensive regression.

## Parameter count and vector dimension are different

An encoder with more neural parameters typically consumes more inference memory and compute, but output dimensionality depends on the architecture or output projection. Two 768-dimensional encoders can differ dramatically in throughput. Some models support reduced output dimensions without an equivalent reduction in model inference cost.

A larger generative language model has a separate resource profile. Raw 16-bit weight memory is approximately two bytes per parameter: seven billion parameters imply about 14 GB of weight storage and seventy billion about 140 GB, before runtime buffers and key-value (KV) cache. Quantization can reduce memory with implementation-dependent quality and overhead.

A larger context window adds prefill work and KV-cache memory per active request. Production cost is better compared using p95 latency and cost per **successful task**, including retries and tool calls, rather than raw parameter count.

[Model selection experiments]({{ '/ai-engineering/retrieval/retriever-generator-selection/' | relative_url }}) show how to judge whether greater representation capacity improves the target workload. [KV cache and decode]({{ '/ai-engineering/inference/prefill-decode-kv-cache/' | relative_url }}) explain the separate serving bottleneck.
