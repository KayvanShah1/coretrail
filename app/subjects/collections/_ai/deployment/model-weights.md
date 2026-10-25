---
title: "Where model weights live"
description: "Follow model weights from remote storage or cache through local disk and host memory into graphics-processing-unit memory."
chapter: deployment
order: 2
sequence: 302
level: Core
mermaid: true
keywords:
  - model weights
  - checkpoint
  - object storage
  - persistent volume
  - node cache
  - VRAM
  - init container
aliases:
  - model checkpoint storage
  - weight loading
tools:
  - Hugging Face
  - S3
  - GCS
  - vLLM
  - Triton
interview_queries:
  - where are LLM weights stored
  - does the container download model weights
  - how are model weights loaded into GPU memory
references:
  - title: NVIDIA Triton model repository
    url: https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/model_repository.html
  - title: Kubernetes init containers
    url: https://kubernetes.io/docs/concepts/workloads/pods/init-containers/
  - title: vLLM parallelism and scaling
    url: https://docs.vllm.ai/en/stable/serving/parallelism_scaling/
---

Container startup is only the beginning of model startup. The checkpoint still has to become available to the process and reach graphics processing unit (GPU) memory.

{% capture diagram_code %}
flowchart LR
A["Registry / object storage"] --> B["Persistent or local disk"]
B --> C["Host memory"]
C --> D["GPU video memory (VRAM)"]
D --> E["Ready inference replica"]
{% endcapture %}
{% capture diagram_fallback %}
Model registry or object storage → persistent/local disk → host memory → GPU VRAM → ready inference replica
{% endcapture %}
{% include diagram.html title="A model moves through several storage layers before serving" code=diagram_code fallback=diagram_fallback caption=true %}

## Common deployment patterns

### Bake weights into the image

This makes the image self-contained, but a large checkpoint can turn every image pull into a huge transfer and makes model updates inseparable from image updates.

It can be useful for smaller or tightly controlled artifacts, but it is rarely the only option.

### Let the serving framework download them

A command such as:

`vllm serve <model-id>`

can resolve a remote model and use a local cache. The first start on a fresh machine may download the checkpoint; later starts can reuse the cache if that cache survives.

The cache helps only when it survives the Pod lifecycle. An ephemeral container filesystem disappearing with the Pod gives different startup behavior from a persistent or node-local cache.

### Mount shared or persistent storage

A Pod can mount a PersistentVolume or network filesystem and start the inference engine against a path such as:

`/models/my-model`.

This separates model distribution from the application image, but storage throughput and startup contention now matter.

### Use an init container

An init container can fetch or verify model files into a shared volume before the main inference container starts.

That keeps download/authentication/checksum logic separate from the serving process. Kubernetes guarantees that init containers run to completion before the app containers begin.

### Preload node-local storage

For very large models, teams may put frequently used checkpoints on local non-volatile memory express (NVMe) storage attached to GPU nodes. A new replica scheduled onto a warm node can avoid remote model transfer.

That improves startup at the cost of cache management and placement complexity.

## “Present on disk” is not “ready”

Even with a perfect local cache, startup can still require:

1. reading weight shards;
2. creating tensors;
3. initializing CUDA and distributed communication;
4. moving or mapping weights into accelerator memory;
5. compiling/capturing runtime artifacts where applicable;
6. sizing the key-value (KV) cache;
7. warming the serving path.

The storage layer therefore solves only part of cold start.

vLLM's distributed-serving guidance explicitly recommends pre-downloading Hugging Face models on every node or storing them on a distributed filesystem accessible at the same path rather than relying on every process to fetch them independently.

Next: [From container start to ready replica]({{ '/ai-engineering/deployment/startup-lifecycle/' | relative_url }}).

The shared [model deployment reference]({{ '/ml/serving/model-deployment-serving/' | relative_url }}) shows an image without weights and the pinned-download, verification and publication contract. This page develops checkpoint placement and GPU loading.
