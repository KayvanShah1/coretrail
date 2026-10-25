---
title: "Cold starts and warm GPU capacity"
nav_title: "Cold starts & capacity"
description: "Break LLM scale-up time into node provisioning, image startup, model access, weight loading, compilation, and warmup."
chapter: production
order: 4
sequence: 404
level: "Core + production story"
keywords:
  - cold start
  - warm capacity
  - model loading
  - node local cache
  - prewarming
  - capacity planning
aliases:
  - inference startup latency
  - warm pool
tools:
  - Kubernetes
  - Karpenter
  - vLLM
interview_queries:
  - why is LLM autoscaling slow
  - how do you reduce model cold start
  - scale to zero LLM tradeoff
references:
  - title: AWS - Fast model loading for AI inference on Amazon EKS
    url: https://aws.amazon.com/blogs/containers/fast-model-loading-for-ai-inference-on-amazon-eks/
  - title: vLLM optimization and tuning
    url: https://docs.vllm.ai/en/stable/configuration/optimization/
---

Large language model (LLM) autoscaling reacts to demand, but the requested graphics processing unit (GPU) capacity can take a long time to become ready.

A scale-out path can include:

1. Provision the GPU virtual machine (VM) and join the cluster.
2. Pull the container image and obtain model weights.
3. Load tensors and initialize the distributed runtime.
4. Compile or capture execution artifacts, warm up, then pass readiness checks.

Any one of those can dominate.

## “Download the model” is not the whole cold start

If weights are already on node-local non-volatile memory express (NVMe) storage, remote transfer can disappear while model loading or compilation remains expensive.

If compilation is cached, a much larger checkpoint may make storage and weight loading dominate again.

This is why measuring startup as one number is not enough. Break it into phases before optimizing.

## Production story: AWS measured different bottlenecks at different model sizes

In a 2026 Elastic Kubernetes Service (EKS) model-loading investigation, Amazon Web Services (AWS) described tested model artifacts in roughly the 60–200 GiB range. Their measurements showed that a smaller model's startup could be dominated by compilation while a much larger model shifted the bottleneck toward weight loading.

For one 64 GiB tested configuration, subsequent launch time on the same node was reduced from 82 seconds to 16 seconds after loading/compilation optimizations.

The lesson is more useful than the exact number:

> Measure the startup path. The part that looks largest from the architecture diagram may not be the part consuming the time.

See the AWS article in References for the exact setup and measurements.

## Warm capacity trades money for response time

Keeping idle or underused GPU capacity ready means traffic spikes can be absorbed before new nodes/models finish starting.

That costs money.

Running at almost no spare capacity saves idle cost but increases the chance that users feel queueing while the infrastructure catches up.

This is capacity planning, not merely autoscaler configuration.

## Node-local caches trade simplicity for locality

A warm GPU node with the right model on local disk can start a replica much faster than a completely fresh machine.

But now placement matters:

```text
Node A: model already cached
Node B: model not cached
```

A scheduler or prefetch system can exploit that locality, but the operational system becomes more complex.

## Scale to zero is workload-dependent

Scale-to-zero can be attractive for rarely used models. For an interactive endpoint with very large checkpoints, the first caller may inherit node provisioning plus model startup.

Ask:

- Is the model used frequently enough to justify a warm minimum?
- Can traffic tolerate a cold-start delay?
- Can another model serve while the preferred model warms?
- How predictable are traffic peaks?
- Can capacity be scheduled ahead of known demand?

Next: [Failures and recovery]({{ '/ai-engineering/production/failures/' | relative_url }}).
