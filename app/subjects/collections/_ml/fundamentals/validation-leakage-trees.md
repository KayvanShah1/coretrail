---
title: "Validation, leakage, metrics, and tree models"
description: "Understand what a model has learned and why offline performance can be misleading."
chapter: fundamentals
order: 1
sequence: 51
level: Core
keywords:
  - Validation, leakage, metrics, and tree models
interview_queries:
  - explain validation, leakage, metrics, and tree models
---

In supervised machine learning (ML), the training split fits model parameters, the validation split guides hyperparameters and thresholds, and the test split estimates generalization after decisions have been made. A randomly shuffled split can be misleading for time-series forecasting, near-duplicate entities or users appearing in both train and test.

## Time-series leakage

If tomorrow's power demand is being forecast, a feature computed from tomorrow's actual readings cannot be used, even if a dataframe expression made it appear alongside historical columns. Every feature needs an availability timestamp. A time-aware split should respect prediction horizon, ingestion delay and the actual time features become available.

## Classification measures

Precision = TP / (TP + FP), recall = TP / (TP + FN), and F1 is their harmonic mean. Accuracy can mislead when failures are rare. Precision-recall curves, false-positive costs, calibration and performance by subgroup help choose a usable decision threshold.

## Trees and ensembles

A decision tree chooses splits that improve a criterion, such as Gini impurity or information gain for classification and squared-error reduction for regression. A deep tree can fit interactions but overfit small samples.

A random forest trains multiple trees with data and feature randomness, reducing variance by averaging or voting. Gradient boosting builds trees sequentially to improve a differentiable objective, commonly using loss gradients. Compare bias-variance behavior, training time, prediction latency and the actual evaluation distribution rather than assuming one ensemble always wins.

## What if training is excellent but validation is weak?

Check data leakage, overfitting, inconsistent preprocessing, split assumptions, changed class balance and whether the deployment population resembles the sampled test data. Monitor input drift and delayed quality labels after release, but remember that distribution shift alone does not prove predictive accuracy has worsened.
