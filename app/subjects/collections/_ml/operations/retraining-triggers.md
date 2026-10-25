---
title: "Retraining triggers, evaluation gates and rollback"
description: "Turn monitoring evidence into a bounded candidate-training workflow with mature labels, cooldowns, release gates and recoverable promotions."
chapter: operations
order: 3
sequence: 203
level: Core
keywords: [retraining triggers, continuous training, champion challenger, cooldown, label maturity, model rollback, scheduled retraining, online learning]
interview_queries: [when should a model be retrained, should drift automatically trigger retraining, how do you prevent retraining loops, retraining vs recalibration]
last_verified: "2026-10-25"
references:
  - title: Google Cloud continuous training architecture
    url: https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning
  - title: MLflow registry versions and aliases
    url: https://mlflow.org/docs/latest/ml/model-registry/workflow/
---

A monitoring event can open an investigation or start candidate training. Promotion changes user-facing behavior and needs its own evaluation decision. A system that replaces the model whenever a distribution threshold fires can repeatedly deploy worse models trained on a broken feed.

## Choose the trigger from the reason to update

| Trigger | When it earns its cost | Guard before training |
|---|---|---|
| Scheduled | Known seasonality, regular label arrival or a freshness requirement | Enough new representative examples and a justified training window |
| Performance-based | Mature-label loss, calibration or a critical slice degrades persistently | Valid labels, comparable cohorts and meaningful effect size |
| Distribution-based | Input changes warrant an early candidate or investigation before outcomes mature | Source quality, seasonality and whether the new population is supported |
| New-data / business event | New product, region, policy or sufficient verified labels | Coverage, label definition and intended target behavior |
| Manual investigation | Incident analysis identifies a training-related remedy | Recorded reason, owner and evaluation plan |

Continuous training automates this workflow. Online learning updates parameters incrementally as observations arrive; it has additional concerns such as poisoned feedback, ordering and fast rollback. A recurring batch retrain does not become online learning because its scheduler runs frequently.

## A guarded policy with concrete numbers

**Illustrative forecast policy:** outcomes become mature after 24 hours. The reference mean absolute error (MAE) is 20 units for matched weekday/hour cohorts. Consider a retraining candidate when MAE exceeds 24 units, a 20% relative increase, in three consecutive non-overlapping daily windows. Each window must contain at least 2,000 mature predictions with adequate coverage of the affected segments.

| Observation | Policy outcome |
|---|---|
| MAE 26 in one window, then 21 | Record and investigate; the persistence condition did not pass |
| MAE 26 for three windows, but labels are incomplete | Repair or wait for outcome coverage; block the training trigger |
| Feature missingness spikes after a source change | Repair data and replay affected features before reconsidering training |
| MAE 26 for three valid windows; no open candidate; last retrain 10 days ago | Start one candidate using a frozen data snapshot |
| Another alert arrives while that candidate is training | Attach evidence to the existing incident/candidate; do not start duplicates |
| Quality remains stable despite hotter weather | Continue monitoring the expected input shift |

These values are example policy parameters, not recommended universal thresholds. Calibrate the window, sample size and effect against ordinary variability, business loss and training cost. Overlapping windows are correlated, so three alerts from nearly identical data provide less evidence than three independent periods.

## Make the training workflow resumable

Persist the trigger ID, reference/current window IDs, metric definition, diagnosis, input snapshot, training configuration and candidate status. Deduplicate the trigger; use a lease or equivalent coordination to prevent competing trainers. An illustrative seven-day cooldown limits repeated training, while a severe verified incident can follow a separately authorized override procedure.

A candidate moves through eligibility checks, snapshot construction, training, evaluation and either rejection or release. Failed tasks resume from durable artifacts where valid. Exhausted retries produce a visible terminal failure and an owner; the next monitoring tick should not silently create a new unbounded loop.

Snapshot both features and labels with their availability times. A rolling training window adapts faster but can forget rare regimes; an expanding window retains history but may overweight obsolete behavior. Compare the choice through time-appropriate validation rather than assuming that more recent data is always better.

## Compare the candidate with the incumbent

Evaluate both on the same untouched, time-appropriate holdout and important slices. Gate predictive loss, calibration, mistake cost, fairness where relevant, input compatibility, inference latency, memory and startup behavior. Preserve a regression set for rare but costly cases. Repeatedly tuning to the same holdout eventually contaminates the release decision; refresh evaluation governance as the development process evolves.

A registry records the candidate artifact and evidence. Resolve its immutable version into a deployment release, run shadow or canary evaluation, and retain rollback state. Moving an MLflow alias changes a registry pointer; running servers need an explicit reload or deployment mechanism before their loaded model changes.

Rollback restores the compatible model, preprocessing, threshold and feature contract. Reverting only weights can leave a new encoder or schema paired with an old model. Delayed labels also mean that an operationally healthy canary cannot immediately prove long-term predictive benefit.

## Select the smallest effective remedy

| Evidence | Candidate action |
|---|---|
| Units, nulls, joins or feature freshness broke | Repair the pipeline; backfill or replay, then recompute affected predictions where appropriate |
| Ranking remains useful but probabilities shifted | Validate recalibration; compare calibration and downstream decision cost |
| Costs or review capacity changed | Re-evaluate the decision threshold under the new business objective |
| Relationship changed and representative labels exist | Retrain and compare against the incumbent |
| New facts are missing from a RAG answer | Update source documents and the retrieval index |
| Retrieval is correct but a new prompt worsened answers | Revert or revise the prompt and run release evaluation |
| A model/provider revision changed behavior | Compare a pinned revision or alternative; gate the whole AI release |

For AI, the versioned release includes prompts, retrieval configuration, tools, adapters and provider settings. Fine-tuning a generator is one possible response after isolating a learned-behavior gap. [AI release evaluation]({{ '/ai-engineering/evaluation/metrics-release-gates/' | relative_url }}) owns those stage-specific quality gates; [drift diagnosis]({{ '/ml/operations/drift-detection/' | relative_url }}) owns the statistical distinctions.
