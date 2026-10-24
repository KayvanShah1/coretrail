---
title: "Model selection, calibration and error analysis"
description: "Design trustworthy baselines, splits, hyperparameter searches and probability thresholds before promoting a supervised model."
chapter: fundamentals
order: 5
sequence: 55
level: Intermediate
math: true
keywords: [cross validation, stratified split, group split, learning curves, hyperparameter tuning, calibration, bias variance]
aliases: [ML model comparison, threshold tuning, baseline models]
interview_queries: [how to choose between random forest and XGBoost, how to investigate an ML model that fails in production]
---
A machine-learning experiment starts with a prediction target and a decision. The model family matters only after the data split reproduces the decision environment. A random split can make a high-capacity model appear excellent when near-identical records, future statistics or entity identifiers recur in both training and evaluation.

## Baselines establish what complexity buys

Use a constant or majority-class baseline, a simple linear/logistic model and a strong tabular baseline before expensive experiments. Logistic regression expresses a linear relationship in log-odds and often gives an interpretable first discriminator:

{% include math.html tex="P(Y=1\mid x)=\sigma(w^\top x+b),\qquad \sigma(z)=\frac{1}{1+e^{-z}}" block=true %}

Regularization controls weight magnitudes; feature scaling and collinearity matter more for linear optimization than for standard decision-tree splits.

Random Forest averages randomized trees, helping reduce variance relative to an individual deep tree. Gradient-boosted trees iteratively correct the ensemble using the loss gradient, often providing strong structured-data performance with tuning. An LSTM or Transformer adds temporal representation capacity only when meaningful sequences and enough data justify that cost.

| Candidate | What it can add | What you pay for |
|---|---|---|
| Logistic / regularized linear | Transparent baseline, often calibrated with care | Limited nonlinear interactions without feature engineering |
| Random Forest | Nonlinear relationships, variance reduction | Larger ensembles and less controlled extrapolation |
| XGBoost / histogram boosting | Strong tabular loss optimization | Search space, calibration and possible overfitting |
| Sequence model | Learned evolving histories | Data volume, sequential training, serving windows |

## Match the split to the failure mode

**Stratification** controls label mix across sampled sets, but does not prevent related accounts or documents leaking across folds. **Group splits** hold entire users, projects or other correlated entities out together. **Chronological splits** train only on earlier data, respecting lag, publication time and observation windows. Purging or embargoes can be needed when targets and feature windows overlap across adjacent splits.

Hyperparameters are tuned using a validation set or appropriate cross-validation. A final test set should remain untouched during exploration. Repeatedly selecting models based on the same test score turns it into another validation set.

## Separate ranking, probability, and action

A high receiver operating characteristic area under curve (ROC-AUC) indicates a model ranks positive cases above negatives. It does not prove that the numerical probability is calibrated or that a 0.5 threshold is suitable.

A calibration curve bins predictions and compares predicted to observed frequency. Brier score and log loss measure probability quality. If a system has capacity to review 200 alerts per day, inspect precision and recall within that capacity. Use a cost matrix when false alarms and misses have distinct financial consequences.

A calibration transform fitted on validation predictions must not learn from the test outcomes. Recalibrate when the deployment population or base rate changes materially, with due regard for delayed labels.

## Diagnose a surprising improvement

Suppose a model's F1 suddenly jumps from 0.72 to 0.98 after adding a new customer identifier. Before celebrating, check target encoding, duplicate entities, post-outcome columns, temporal availability and leakage through imputation. Inspect performance on genuinely unseen groups and future dates.

Then break errors down by class prevalence, low-frequency categories, acquisition channel, missingness, target value, time horizon and data version. A model can regress on a small costly population while its aggregate score improves. Record comparison confidence and dataset size; tiny percentage gains on a few dozen cases rarely justify a risky deployment.

## When a model is deployed

Monitor schema rejection, input freshness, feature parity, response latency and prediction distribution immediately. True precision or regression error requires labels and often arrives later. A shift in input distribution is a reason to investigate the pipeline and population, not automatic proof that retraining will help.

See [classification metrics and thresholds]({{ '/ml/fundamentals/classification-metrics-thresholds/' | relative_url }}), [survival prediction]({{ '/ml/fundamentals/xgboost-lstm-survival/' | relative_url }}) and [MLOps monitoring]({{ '/ml/operations/model-lifecycle-monitoring/' | relative_url }}).
