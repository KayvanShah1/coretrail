---
title: "Data drift, concept drift and training-serving skew"
description: "Identify the changing distribution, choose comparable monitoring windows and distinguish statistical change from predictive harm."
chapter: operations
order: 2
sequence: 202
level: Core
math: true
keywords: [data drift, covariate shift, concept drift, label shift, prediction drift, performance drift, training serving skew, PSI, KS test, Jensen Shannon, Wasserstein]
interview_queries: [different types of model drift, how do you detect concept drift without labels, PSI vs KS for drift, data drift vs training serving skew]
last_verified: "2026-10-25"
references:
  - title: Vertex AI model monitoring
    url: https://cloud.google.com/vertex-ai/docs/model-monitoring/overview
  - title: Evidently drift monitoring concepts
    url: https://learn.evidentlyai.com/ml-observability-course/module-2-ml-monitoring-metrics/data-prediction-drift-in-ml
  - title: Evidently drift test definitions
    url: https://docs.evidentlyai.com/metrics/explainer_drift
  - title: SciPy two-sample KS test
    url: https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ks_2samp.html
  - title: Dataset shift in machine learning, MIT Press
    url: https://mitpress.mit.edu/9780262170055/dataset-shift-in-machine-learning/
---

A monitor reporting “drift” has detected change relative to a reference. The next question is which distribution changed, whether the comparison is valid, and whether predictions became worse.

## Name the changing quantity

Let `X` denote model inputs, `Y` the observed outcome and `ŷ` the prediction. Reference and current windows can differ in several ways:

| Change | Meaning | Example and evidence |
|---|---|---|
| Input or feature drift | The distribution of `X` changes | A new region contributes more requests; compare feature and segment distributions |
| Covariate shift | Input distribution changes while the conditional outcome relationship is assumed stable | More hot days, but demand at the same weather/calendar conditions behaves as before |
| Concept drift | The conditional relationship between inputs and outcomes changes | After a tariff change, the same weather and calendar conditions produce different demand |
| Label / prior shift | Outcome prevalence changes; under the strict label-shift assumption, input distributions within each outcome class stay stable | Fraud becomes more prevalent; verify mature outcomes and the assumption before using prior correction |
| Prediction drift | Scores, predicted classes or generated-output characteristics change | More high-risk scores; inspect input mix, release versions and thresholds |
| Performance degradation | Error, calibration, slice quality or business loss worsens | Mature forecast error rises even after matching relevant segments |
| Training-serving skew | Training and serving differ in data or computation | Training uses daily totals but serving reads incomplete intraday values |

The mathematical distinctions for input change and concept drift are:

{% include math.html tex="P_{\mathrm{ref}}(X)\ne P_{\mathrm{cur}}(X)" block=true %}
{% include math.html tex="P_{\mathrm{ref}}(Y\mid X)\ne P_{\mathrm{cur}}(Y\mid X)" block=true %}

Broad data drift does not establish the stable-conditional assumption required by covariate shift. Skew can exist on the first day of deployment, before any temporal drift. A score shift can result entirely from a new model release. None of those observations alone proves concept drift.

Changes may be sudden, gradual, incremental or recurring. A holiday pattern recurring each year can look anomalous against an ordinary-week baseline. Preserve seasonality and rollout annotations so a detector has the right context.

## Compare like with like

Use a frozen training/validation reference to detect movement away from development data, and a recent production reference to detect new operational changes. They answer different questions. A rolling reference adapts to current traffic but can absorb a slow deterioration until the alert disappears.

Match event-time windows, label maturity, important regions and sampling policy. Track counts, missingness, category additions, feature freshness and rejected records before distribution distances. A changed monitor sample or a delayed source partition can create apparent drift without a changed population.

| Method | What it compares | Interpretation limit |
|---|---|---|
| Kolmogorov–Smirnov (KS) test | Maximum difference between two numeric empirical cumulative distributions | Large samples detect tiny changes; inspect effect size and dependent/time-series samples |
| Population Stability Index (PSI) | Differences in proportions across fixed bins | Bin boundaries and zero-count handling change the result; familiar cutoffs are not universal gates |
| Jensen–Shannon divergence | Difference between probability distributions over shared support/bins | Category mapping, smoothing and binning need stable definitions |
| Wasserstein distance | How far probability mass moves in a numeric variable | Units and feature scale affect magnitude |
| Multivariate detector | Joint behavior, often through a reference-vs-current classifier | Can detect interactions missed by marginal tests; needs validation and interpretation |

Use a test's assumptions, an operational effect size and a calibrated false-alert budget. Checking hundreds of features at an unadjusted significance threshold creates repeated false alerts. Persistence, multiple-testing control where applicable and feature importance help prioritize investigations. A marginal test can miss changed relationships even when each individual feature retains its old distribution.

## Labels establish predictive impact

Without outcomes, input drift and proxy signals provide early warnings. They cannot generally identify a changed `Y` given `X` relationship. With mature labels, compare loss, calibration, residual patterns and slice behavior while controlling for release and population changes. Investigate label-pipeline changes as well as the model.

In a demand forecast, a temperature shift with stable matched-condition residuals can be expected summer behavior. Higher residuals at comparable temperatures after a tariff change support investigating a changed relationship. A sudden block of zero meter readings points first to ingestion or feature defects.

AI systems add query, language, document, retrieval and response-distribution changes. A stale document requires a source/index update; poor retrieval requires retrieval diagnosis; a provider model update requires release evaluation. [Retraining and response selection]({{ '/ml/operations/retraining-triggers/' | relative_url }}) connects each finding to an appropriate action.
