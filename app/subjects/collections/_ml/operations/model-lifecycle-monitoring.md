---
title: "Experiment tracking, rollouts and drift diagnosis"
description: "Version data, features and model artifacts, then distinguish operational failures from genuine changes in predictive behavior."
chapter: operations
order: 1
sequence: 201
level: Core
math: true
keywords:
  - MLOps
  - MLflow
  - model registry
  - model monitoring
  - concept drift
  - feature drift
  - continuous training
  - shadow deployment
interview_queries:
  - explain a production ML pipeline
  - what is concept drift vs data drift
  - when should you retrain a model
---

An experiment is reproducible when another run can identify the same source snapshot, label definition, feature transformations, code, dependency versions, random seeds and model configuration. Tracking a single AUC score does not provide that guarantee.

## From training to a controlled release

{% capture diagram_code %}
flowchart LR
A["Versioned data + features"] --> B["Train + track experiment"]
B --> C["Holdout evaluation"]
C --> D{"Meets release gate?"}
D -- "No" --> B
D -- "Yes" --> E["Model registry"]
E --> F["Shadow / canary rollout"]
F --> G["Monitor + compare"]
{% endcapture %}
{% capture diagram_fallback %}
Versioned data and features → train and track → holdout evaluation → release gate. Candidates that pass enter the registry, then shadow or canary rollout, followed by monitoring and comparison.
{% endcapture %}
{% include diagram.html title="Model release uses data and evaluation gates" code=diagram_code fallback=diagram_fallback caption=true %}

Experiment trackers such as MLflow record run parameters, metrics and artifacts. A model registry records deployable versions and their promotion status. The CI pipeline checks code and data contracts. A scheduled or event-triggered training pipeline produces candidates that must pass evaluation before they replace a deployed model.

**Shadow deployment** computes predictions on copied traffic without exposing new decisions to users. **Canary deployment** sends a controlled slice of real traffic to the candidate. The acceptance thresholds should include latency, error rate and model quality, with rollback conditions agreed before rollout.

## Drift: identify what moved

**Covariate shift** changes input distribution. **Concept drift** changes the relationship between features and labels. Their usual notation is:

{% include math.html tex="P_{\mathrm{train}}(X)\ne P_{\mathrm{live}}(X)" block=true %}
{% include math.html tex="P_{\mathrm{train}}(Y\mid X)\ne P_{\mathrm{live}}(Y\mid X)" block=true %}

In practice, a rising null rate may be an ingestion failure, not a population change. A changed feature distribution need not imply worse predictions. Check versioned inputs, feature freshness and training-serving parity before drawing conclusions.

Accuracy, precision or forecast error often require labels that arrive days or weeks later. Until then, monitor input distributions, scores, serving latency, schema failures and delayed-outcome coverage. Report whether the quality sample is mature and representative.

## What deserves an alert?

| Signal | Immediate investigation |
|---|---|
| Nulls or missing entities spike | Source ingestion, joins and feature materialization |
| Feature age exceeds contract | Stream lag, scheduled jobs or store update failures |
| p95 inference time rises | Queue, dependencies, compute saturation, rollout |
| Model score distribution shifts | Input changes, feature parity and deployment versions |
| Confirmed precision/recall drops | Thresholds, population, labels, concept drift |
| Business cost rises | Mistake severity, calibration, acceptance threshold |

Retraining is a candidate remedy after these checks. An upstream transformation bug will usually persist if you retrain on the same corrupt inputs.

## Practical example: electricity demand

Forecast accuracy depends on timestamp-safe weather forecasts, load history and calendar features. If procurement penalties increase despite stable offline mean absolute error (MAE), inspect whether errors are concentrated at costly peak hours, whether feature freshness changed, and whether the model is poorly calibrated for the operational decision. Business loss and statistical loss need separate tracking.

AI workflows add prompt, retrieval index, tool and model versions to this lifecycle. The corresponding evaluation techniques are covered in [AI evaluation]({{ '/ai-engineering/evaluation/overview/' | relative_url }}).
