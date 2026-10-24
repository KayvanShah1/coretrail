---
title: "GPU scheduling, Pending Pods and inference incidents"
description: "Diagnose how resource requests, node capacity, probes and model memory affect a Kubernetes inference rollout."
chapter: kubernetes
order: 5
sequence: 205
level: Core
keywords: [GPU scheduling, Pending Pod, OOMKilled, readiness, device plugin, HPA, GPU autoscaling]
interview_queries: [why is my GPU pod Pending, how do you debug an OOMKilled model server, how does Kubernetes scale LLM inference]
---

The Kubernetes scheduler chooses a node for each Pod using resource requests and placement constraints. Graphics processing unit (GPU) device plugins expose allocatable accelerator resources such as `nvidia.com/gpu`. A container image may contain CUDA userspace libraries, but it does not create physical GPU capacity or install the host driver.

## Trace the symptom before changing capacity

| Symptom | Evidence to inspect | Likely owner |
|---|---|---|
| Pod Pending | Events, resource requests, taints, node selectors and quotas | Scheduler / node capacity |
| Pod CrashLoopBackOff | Previous logs, termination reason, startup and liveness probes | Application startup |
| OOMKilled | Memory limit, model weights, runtime allocation | Container resource use |
| Running but unready | Readiness probe, model load state, dependency health | Application readiness |
| High time to first token | Queue depth, prefill duration, cache pressure | Inference engine / routing |
| HPA adds replicas but throughput stays flat | Pending replicas, GPU/node headroom, upstream bottleneck | Autoscaling and capacity |

A Pod with a GPU request remains Pending when no suitable node has capacity. A node autoscaler may provision capacity if policy, cloud quota and accelerator availability allow it. GPU nodes can take long enough to provision and load model weights that traffic must be handled through admission controls and warm headroom.

## Resource limits and probes

Central processing unit (CPU) requests inform placement and resource share; CPU limits can throttle processing. A container exceeding its memory limit can be killed. GPU allocation uses extended resource requests rather than ordinary CPU percentages.

Use a startup probe for long model initialization, readiness to control when a loaded model receives traffic, and liveness for conditions where restarting the process helps. A port that accepts connections may become available long before all weights are loaded.

A too-aggressive liveness probe can repeatedly restart a cold model server. Raising its timeout without examining logs may hide a genuine boot error; inspect weight download, device visibility, runtime compatibility and memory requirements first.

## What should drive scaling?

Horizontal Pod Autoscaler (HPA) can use custom metrics. For large language model (LLM) inference, request backlog, waiting time, token throughput and key-value (KV) cache utilization can be more informative than CPU usage. A node autoscaler operates separately to add or remove worker capacity.

An accelerator can be busy while delivering healthy throughput. If queue time and user-visible latency grow despite batching, more warm serving capacity or admission control may be needed.

A model replica that spans multiple GPUs can fail as one logical serving unit if any required device or communication path fails. Recovery policies should reflect that unit.

Continue to [workload versus node autoscaling]({{ '/infrastructure/scaling/workload-node-autoscaling/' | relative_url }}) and [LLM capacity planning]({{ '/ai-engineering/production/cold-starts-capacity/' | relative_url }}).
