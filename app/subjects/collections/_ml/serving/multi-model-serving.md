---
title: "Multi-model serving, grouping and memory capacity"
description: "Distinguish models, versions, replicas and workers, then choose shared or isolated placement from memory, traffic and release requirements."
chapter: serving
order: 3
sequence: 103
level: Core
math: true
keywords: [multi model serving, model grouping, model multiplexing, model instance, worker processes, LoRA adapters, model memory, noisy neighbor]
interview_queries: [how many models fit in one container, how should models be grouped, can vLLM serve multiple models, when should models use separate deployments]
last_verified: "2026-10-25"
references:
  - title: Triton concurrent model execution
    url: https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/model_execution.html
  - title: Triton model management
    url: https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/model_management.html
  - title: vLLM frequently asked questions
    url: https://docs.vllm.ai/en/stable/usage/faq/
  - title: vLLM LoRA adapters
    url: https://docs.vllm.ai/en/stable/features/lora/
---

A container has no universal model-count limit. For a graphics processing unit (GPU) workload, device memory adds another placement limit. The serving runtime must support the intended models, and their resident state plus peak execution memory must fit while meeting latency targets. Ten small classifiers and two large generators present very different placement problems.

## Count the correct unit

| Unit | Meaning | Capacity consequence |
|---|---|---|
| Model | A prediction function with its artifacts | Different models usually need separate resident parameters |
| Version | A particular artifact revision | A rollout may temporarily hold old and new revisions |
| Instance or worker | A loaded execution copy | More workers may duplicate parameters and runtime state |
| Replica | An independently routable serving unit | Replicas multiply capacity and memory use; one may span devices |
| Adapter | An update compatible with a particular base model | Can share base parameters when the engine supports it |
| Container / Pod | Process packaging / Kubernetes scheduling unit | Does not by itself define how many models or GPUs a runtime uses |

Two model names exposed by an endpoint may refer to aliases for one loaded model. Conversely, four worker processes can create four loaded copies behind one endpoint. Inspect the runtime configuration and measured memory, not endpoint names.

## Shared server or separate deployments

| Placement | Fits when | Cost or failure to test |
|---|---|---|
| Several small models in one server | Compatible dependencies, modest traffic, similar ownership | Shared memory limit, failures and scaling; one hot model can dominate |
| Separate process/container per model | Independent versions, dependencies or restart needs | More runtime overhead; shared devices still need explicit memory budgets |
| Separate deployment per model or workload class | Different latency, security, traffic or release schedules | Lower packing efficiency and more operational units |
| Load/unload models on demand | Large catalog with few active models | Cold loads, eviction, disk/cache capacity and admission failures |
| Shared base with several adapters | Compatible base revision and adapter support | Adapter residency limits, batching restrictions and tenant isolation |

NVIDIA Triton supports multiple models with per-model scheduling and concurrent execution subject to resources and backend behavior. Model instance counts can add parallel execution copies. Its model-control modes govern loading and unloading; explicit management is preferable when a controller must decide exactly which artifacts become active.

For ordinary vLLM serving, plan a server instance around one base model; use separate instances for unrelated base models. Multi-LoRA serving can expose compatible low-rank adaptation (LoRA) adapters over that base. This does not turn arbitrary checkpoints into memory-sharing adapters. Verify the engine/version's adapter limits and protect model-management endpoints.

## Group by operational compatibility

Grouping starts from the resource and failure contract. Compare accelerator type, runtime/dependency compatibility, memory behavior, latency target, request shape, tenant permissions, ownership, release cadence and scaling pattern. A shared task label such as “natural language processing (NLP)” provides little evidence that two workloads should share a process.

A retrieval-augmented generation (RAG) system might contain an embedding model, reranker and generator. Their calls form a pipeline, but their capacity curves differ: ingestion can flood embeddings, reranking scales with candidate count, and generation retains per-request attention state. Independent pools allow each stage to scale and fail separately. Co-location can still work at low traffic if joint load tests demonstrate sufficient headroom.

Interactive and overnight batch requests can use the same model weights while needing different queues or deployments. Otherwise a long batch can consume all useful concurrency and make interactive latency unpredictable. Model routing should enforce an allowed model/version list rather than accept arbitrary artifact URLs from callers.

## Estimate the resident set, then load-test

For one memory domain, a planning condition is:

{% include math.html tex="M_{\mathrm{shared}}+\sum_i n_i M_{\mathrm{resident},i}+M_{\mathrm{peak\ requests}}+M_{\mathrm{headroom}}\le M_{\mathrm{available}}" block=true %}

Here `n_i` counts loaded copies of model `i`; resident memory includes each copy's parameters and private runtime state. Measure this separately for host memory and each accelerator. Aggregate memory across several GPUs does not prove a valid per-device placement. Request memory depends on batching, input shape and, for generators, [key-value (KV) cache capacity]({{ '/ai-engineering/inference/prefill-decode-kv-cache/' | relative_url }}).

**Illustrative host-memory budget:** a 16 GiB container reserves 2 GiB for shared server state and 3 GiB of safety headroom. Models A, B and C each have one measured 1.5 GiB resident instance; their combined peak request workspace is 2 GiB. Estimated use is:

{% include math.html tex="(2+4.5+2+3)\,\mathrm{GiB}=11.5\,\mathrm{GiB}" block=true %}

Holding total request workspace at 2 GiB while running two independent copies of every model gives:

{% include math.html tex="(2+9+2+3)\,\mathrm{GiB}=16\,\mathrm{GiB}" block=true %}

That consumes the entire budget before any unmodeled loading spike. That configuration needs measurement or a different placement; an arithmetic equality is a poor operating margin.

Disk checkpoint size is not resident memory. Quantized parameters, deserialization, temporary copies, allocator fragmentation and runtime workspaces can change the result. Also measure replacement peaks: loading C version 2 while version 1 is still serving can fail even when either version fits alone.

At expected and burst traffic, record per-model latency, throughput, queue age, memory high-water marks, cold-load time and behavior during unload/reload. Use the combined workload mix. Independently benchmarking A and B misses contention when both execute together.
