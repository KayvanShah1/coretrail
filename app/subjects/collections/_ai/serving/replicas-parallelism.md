---
title: "Replicas, tensor parallelism, and pipeline parallelism"
nav_title: "Replicas & parallelism"
description: "Compare model parallelism inside one replica with horizontal replication for more serving capacity."
chapter: serving
order: 3
sequence: 203
level: "Core + deep dive"
mermaid: true
keywords:
  - tensor parallelism
  - pipeline parallelism
  - data parallelism
  - replicas
  - multi GPU inference
  - distributed inference
  - GPU topology
aliases:
  - TP
  - PP
  - model parallelism
  - multi-GPU serving
tools:
  - vLLM
interview_queries:
  - how do you serve a model that does not fit on one GPU
  - tensor parallelism vs pipeline parallelism
  - replica vs tensor parallelism
references:
  - title: vLLM parallelism and scaling
    url: https://docs.vllm.ai/en/stable/serving/parallelism_scaling/
  - title: vLLM data parallel deployment
    url: https://docs.vllm.ai/en/stable/serving/data_parallel_deployment/
  - title: vLLM multi-node serving example
    url: https://docs.vllm.ai/en/stable/examples/ray_serving/multi-node-serving/
  - title: Google Cloud - multi-host LLM serving on GKE
    url: https://docs.cloud.google.com/kubernetes-engine/docs/tutorials/serve-multihost-gpu
---

“Use more graphics processing units (GPUs)” can describe three different scaling choices: tensor parallelism, pipeline parallelism, or more serving replicas.

{% capture diagram_code %}
flowchart TB
subgraph R1["Replica A"]
A1["GPU 0"] --- A2["GPU 1"]
A2 --- A3["GPU 2"]
A3 --- A4["GPU 3"]
end
subgraph R2["Replica B"]
B1["GPU 4"] --- B2["GPU 5"]
B2 --- B3["GPU 6"]
B3 --- B4["GPU 7"]
end
C["Router"] --> R1
C --> R2
{% endcapture %}
{% capture diagram_fallback %}
Router → Replica A (GPU 0-3) or Replica B (GPU 4-7). GPUs inside each replica can cooperate to execute one model; replicas independently serve traffic.
{% endcapture %}
{% include diagram.html title="Parallelism inside a replica, replication across traffic" code=diagram_code fallback=diagram_fallback caption=true %}

## Tensor parallelism splits work inside model layers

If a model does not fit comfortably on one GPU, tensor parallelism can partition tensor operations across multiple GPUs.

One logical model replica might therefore require:

`GPU 0 + GPU 1 + GPU 2 + GPU 3`.

The GPUs must exchange intermediate results frequently, so communication topology matters. High-bandwidth links inside a node can make tightly coupled tensor-parallel work much more practical than spreading it across ordinary cross-node networking.

vLLM's current guidance is straightforward: if the model fits on one GPU, distributed inference may be unnecessary; if it needs several GPUs in one node, tensor parallelism is a common choice.

## Pipeline parallelism splits layers or stages

Pipeline parallelism places different ranges/stages of the model on different workers.

Conceptually:

`early layers → middle layers → later layers`.

This can help when the model must span nodes or when tensor-parallel communication would be unsuitable. It introduces its own pipeline utilization and communication trade-offs.

vLLM recommends combining tensor and pipeline parallelism when a model must span several multi-GPU nodes.

## Serving replicas duplicate capacity

Replication solves a different problem.

If one four-GPU replica can serve a certain amount of traffic, a second four-GPU replica gives the router another independent serving target. The weights are replicated and both replicas can process independent request batches.

That is horizontal serving capacity, often called data-parallel serving at a high level.

So:

- **tensor/pipeline parallelism** helps construct one logical model replica;
- **replicas/data parallelism** help serve more independent traffic.

## A replica is a logical failure and capacity unit

The mapping is not fixed:

`1 replica ≠ 1 GPU ≠ 1 Pod`.

A small model might use one GPU and one process. A large model can span eight GPUs on one machine. An even larger replica can span multiple machines.

That changes failure handling. If one worker is required for a distributed replica and that worker disappears, the useful capacity loss may be the whole replica, not merely one GPU's fraction of traffic.

## Optional deep dive: topology changes the cost of parallelism

When one logical replica spans several GPUs, the workers have to exchange intermediate results.

```text
same node
GPU ↔ high-bandwidth GPU interconnect ↔ GPU

across nodes
GPU ↔ network fabric ↔ GPU
```

The farther apart the participating GPUs are, the more communication can affect inference latency and throughput. In NVIDIA deployments, the NVIDIA Collective Communications Library (NCCL) can coordinate this exchange. The latency comes from the communication pattern and topology, regardless of the library name.

So “the cluster has eight free GPUs” is incomplete information. Eight tightly connected GPUs on one machine and eight GPUs scattered across machines can support very different parallelism strategies.

A distributed replica may also need coordinated placement so enough of its required workers can become available together. The scheduler mechanics belong in infrastructure; the serving consequence is that a partially placed replica may consume resources without becoming useful capacity.

### Concrete example: one replica across 16 GPUs

A 405-billion-parameter (405B) model at 16-bit precision needs about **810 GB decimal (754 GiB)** for weights alone, before runtime memory.

Google's published Llama 3.1 405B multi-host example uses two eight-GPU machines. One serving replica combines tensor parallelism across the GPUs within each machine with pipeline parallelism across the two machines:

Two machines with eight graphics processing units (GPUs) each provide **16 GPUs for one serving replica**.

The example shows why replica count, Pod count, and GPU count have to be reasoned about independently:

`1 replica ≠ 1 Pod ≠ 1 GPU`.

Next: [Routing and serving many users]({{ '/ai-engineering/serving/routing-concurrency/' | relative_url }}).
