---
layout: subject
title: Machine Learning
subject: ml
permalink: /ml/
description: Models, evaluation, and production systems.
keywords:
  - machine learning
  - model serving
  - MLOps
---

## Start with training, evaluation, and serving

The model fundamentals chapter covers validation, leakage, tree ensembles and metric choice. Feature engineering connects raw events to reproducible training and online predictions. The operations chapter follows each model from experiment tracking through releases and delayed production labels. The serving chapter compares a conventional prediction API with autoregressive large language model (LLM) serving. It starts with the production concerns both systems share, then looks at the request shape and resource constraints that change the serving architecture.

<ul class="topic-list">
<li><a href="{{ '/ml/fundamentals/overview/' | relative_url }}">Model fundamentals</a><span>Leakage, splits, metrics, trees, ensembles, and monitoring.</span></li>
<li><a href="{{ '/ml/features/overview/' | relative_url }}">Feature engineering & stores</a><span>Encodings, point-in-time correctness, online/offline features and stale values.</span></li>
<li><a href="{{ '/ml/operations/overview/' | relative_url }}">MLOps & monitoring</a><span>Experiment tracking, deployment and evidence of model degradation.</span></li>
<li><a href="{{ '/ml/serving/overview/' | relative_url }}">Model serving</a><span>Follow the chapter overview into the comparison between traditional ML serving and LLM serving.</span></li>
</ul>

See [AI evaluation]({{ '/ai-engineering/evaluation/overview/' | relative_url }}) for retrieval and agent trajectories, and [Infrastructure]({{ '/infrastructure/' | relative_url }}) for general deployment mechanics.
