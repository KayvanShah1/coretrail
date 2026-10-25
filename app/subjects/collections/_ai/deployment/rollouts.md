---
title: "Updating models without breaking traffic"
description: "Reason about rolling updates, canaries, blue-green releases, warmup, surge capacity, and rollback for slow-starting GPU replicas."
chapter: deployment
order: 4
sequence: 304
level: "Core + operations"
keywords:
  - rolling update
  - canary
  - blue green
  - model rollout
  - rollback
  - surge capacity
  - prewarming
aliases:
  - LLM rollout
  - model release
tools:
  - Kubernetes
interview_queries:
  - how do you deploy a new LLM version safely
  - how do you roll out a model with long startup time
references:
  - title: Kubernetes Deployments
    url: https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
  - title: Kubernetes probes
    url: https://kubernetes.io/docs/concepts/workloads/pods/probes/
---

A normal backend can often start in seconds. A large language model (LLM) replica may need a scarce graphics processing unit (GPU) node, a large checkpoint, runtime initialization, and warmup before it is ready.

That makes rollout capacity a first-class concern.

## A safe replacement sequence

For one replica:

1. Schedule the new Pod and make its image and model available.
2. Load and warm the model, then verify readiness.
3. Shift traffic to the ready replacement.
4. Drain the old replica before stopping it.

The old serving capacity should not disappear before enough new capacity is actually ready.

## Rolling updates trade time for temporary overlap

Kubernetes Deployments gradually create a new ReplicaSet and scale down the old one. `maxSurge` and `maxUnavailable` control how much temporary extra capacity and how much temporary loss are allowed.

For central processing unit (CPU) services, a little surge may be cheap.

For an LLM where each replica consumes several expensive GPUs, “one extra replica during rollout” can be a meaningful capacity and cost decision.

## Canary when correctness or performance may change

A new model or runtime version can change:

- answer quality;
- tokenization or generation behavior;
- memory use;
- time to first token (TTFT) / time per output token (TPOT);
- throughput;
- failure rate;
- tool-call behavior.

Sending a small percentage of traffic to the new version lets you compare those signals before full rollout.

A canary is not useful if you only watch process health. Model quality and serving performance are part of the release.

## Blue-green buys simpler rollback at higher capacity cost

With blue-green, the old and new fleets coexist and traffic switches between them.

Rollback is operationally simple because the old fleet is still present, but GPU duplication can be expensive. This pattern makes more sense when the release risk justifies the temporary capacity.

## Prewarm when startup latency is predictable and painful

A rollout can provision nodes and load the new model before shifting traffic. That turns some cold-start time into planned deployment work rather than user-visible queueing.

The same idea appears in autoscaling: spare warm capacity costs money but reduces the delay between demand arriving and useful inference capacity becoming ready.

The production chapter now connects deployment mechanics to traffic and scaling: [Production LLM systems]({{ '/ai-engineering/production/overview/' | relative_url }}).
