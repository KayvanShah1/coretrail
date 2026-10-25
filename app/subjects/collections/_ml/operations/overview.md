---
title: "MLOps & model monitoring"
nav_title: Overview
description: "Follow reproducible experiments through release, input monitoring and delayed performance labels."
chapter: operations
order: 0
sequence: 200
level: Chapter overview
---

A training metric has limited value unless the dataset, feature definitions, code and deployed artifact can be reconstructed. Production monitoring then asks whether the same assumptions still hold for real requests.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/ml/operations/model-lifecycle-monitoring/' | relative_url }}">Experiment tracking, model registries and release provenance</a><span>Connect training runs, registry artifacts and actual deployments through retained release identities.</span></li>
<li><a href="{{ '/ml/operations/drift-detection/' | relative_url }}">Data drift, concept drift and training-serving skew</a><span>Identify the changed quantity, choose valid references and confirm predictive impact.</span></li>
<li><a href="{{ '/ml/operations/retraining-triggers/' | relative_url }}">Retraining triggers, evaluation gates and rollback</a><span>Apply label maturity, data checks, persistence, cooldowns and candidate promotion gates.</span></li>
</ul>
