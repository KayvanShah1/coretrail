---
title: "From container start to ready replica"
description: "Trace a GPU-serving Pod from scheduling through model loading, runtime initialization, warmup, and readiness."
chapter: deployment
order: 3
sequence: 303
level: Core
mermaid: true
keywords:
  - startup
  - readiness
  - startup probe
  - model loading
  - CUDA initialization
  - warmup
aliases:
  - model cold start
  - replica startup
tools:
  - Kubernetes
  - vLLM
interview_queries:
  - what happens when an LLM pod starts
  - when should an LLM replica receive traffic
references:
  - title: Kubernetes liveness, readiness, and startup probes
    url: https://kubernetes.io/docs/concepts/workloads/pods/probes/
  - title: Kubernetes configure probes
    url: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
  - title: vLLM optimization and tuning
    url: https://docs.vllm.ai/en/stable/configuration/optimization/
---

A running container is still unready if the large language model (LLM) has not finished loading. Production traffic should start only after the serving process can answer requests with the intended model.

{% capture diagram_code %}
flowchart TD
A["Pod scheduled to GPU node"] --> B["Container image available"]
B --> C["Mount / fetch model"]
C --> D["Start inference engine"]
D --> E["Initialize CUDA / distributed runtime"]
E --> F["Load and shard weights"]
F --> G["Allocate key-value (KV) cache"]
G --> H["Compile / warm if needed"]
H --> I["Readiness succeeds"]
I --> J["Traffic"]
{% endcapture %}
{% capture diagram_fallback %}
Pod scheduled → image available → mount/fetch model → start engine → initialize GPU runtime → load/shard weights → allocate KV cache → warm up → readiness succeeds → traffic
{% endcapture %}
{% include diagram.html title="A serving replica has a long path before readiness" code=diagram_code fallback=diagram_fallback caption=true %}

## Placement comes first

Kubernetes decides which node can satisfy the Pod's declared resources and placement constraints. For a graphics processing unit (GPU) workload that might include an NVIDIA GPU resource request, node selectors, affinity, taints/tolerations, and topology constraints.

If no suitable node exists, the Pod can remain **Pending**. That is a cluster-capacity problem, not a vLLM scheduling problem.

## Image startup is only the software layer

The container runtime ensures the image is present and starts the process. If the image is not cached on the node, pulling it adds another startup delay.

Then the workload still needs its model.

## Model loading can dominate startup

The engine resolves configuration and tokenizer state, accesses the checkpoint, initializes accelerator resources, and loads/shards weights across the GPUs assigned to the replica.

Multi-GPU replicas also need their communication groups initialized before useful inference can begin.

## Readiness should represent serving readiness

Kubernetes readiness probes answer whether the Pod should receive traffic through Services.

For LLM inference, “the HTTP process accepted a socket” can be too early. Readiness should remain false until the model is loaded and the server can serve the intended model.

Configure the probe sequence using the [Kubernetes health-probe reference]({{ '/infrastructure/kubernetes/probes-rollouts/' | relative_url }}). For this workload, the startup allowance must cover model loading and warmup; the readiness check must verify the intended model rather than only an open socket.

A live process can still have failed to load the requested checkpoint. A dependency outage can make the replica unready without requiring repeated model reloads. Diagnose which condition failed before choosing a restart.

## Warmup is part of the latency budget

Some inference runtimes compile kernels, capture graphs, profile memory, or populate caches during startup. Those choices can improve steady-state performance while extending cold start.

That leads directly to the next production question: how do we update model replicas without temporarily losing too much expensive serving capacity?

Continue to [Updating models without breaking traffic]({{ '/ai-engineering/deployment/rollouts/' | relative_url }}).
