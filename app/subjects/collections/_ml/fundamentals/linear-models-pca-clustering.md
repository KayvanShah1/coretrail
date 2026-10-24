---
title: "Linear models, PCA and clustering baselines"
description: "Explain regression objectives, regularization, dimensionality reduction and clustering before adding model complexity."
chapter: fundamentals
order: 7
sequence: 57
level: Core
math: true
keywords: [linear regression, logistic regression, L1, L2, ridge, lasso, PCA, k-means, DBSCAN, clustering, standardization]
aliases: [classical ML fundamentals, unsupervised learning basics]
interview_queries: [linear vs logistic regression, why scale features before PCA, k-means vs DBSCAN]
references:
  - title: scikit-learn linear models
    url: https://scikit-learn.org/stable/modules/linear_model.html
  - title: scikit-learn PCA
    url: https://scikit-learn.org/stable/modules/decomposition.html#pca
  - title: scikit-learn clustering
    url: https://scikit-learn.org/stable/modules/clustering.html
---

A simple baseline gives an experiment a reference point. A model that predicts demand from recent load and temperature can expose leakage, missingness or a broken split before a larger sequence model makes the failure harder to inspect.

## Linear prediction and logistic probability

Linear regression predicts a numerical target from a weighted feature sum:

{% include math.html tex="\hat y=w^\top x+b,\qquad \mathcal L=\frac{1}{n}\sum_{i=1}^{n}(y_i-\hat y_i)^2" block=true %}

Squared error penalizes large residuals strongly, so outliers can dominate the fit. A linear model is linear in its fitted coefficients; engineered polynomial features or interactions can still represent nonlinear input relationships. Residual plots reveal systematic curvature or changing error variance that one average metric hides.

Logistic regression uses a sigmoid to map a linear score into a binary-class probability. Its usual fitting objective is binary cross-entropy:

{% include math.html tex="p_i=\sigma(w^\top x_i+b),\qquad \mathcal L=-\frac{1}{n}\sum_i[y_i\log p_i+(1-y_i)\log(1-p_i)]" block=true %}

The fitted probability and the action threshold are separate decisions. For example, changing review capacity can justify a new threshold without refitting the weights. [Classification metrics]({{ '/ml/fundamentals/classification-metrics-thresholds/' | relative_url }}) explains the resulting precision–recall trade-off.

## Regularization and feature scale

Ridge regression adds an L2 penalty on coefficient magnitudes. Lasso adds an L1 penalty, which can set coefficients to zero. Both trade some training fit for a more constrained solution. The penalty strength is selected on validation data.

A feature measured in rupees and another measured in millions of rupees need different numerical coefficients for the same prediction. That changes the effect of a coefficient penalty. Standardizing numerical features makes the penalty and many distance-based methods easier to interpret. Fit the scaler on training data and reuse its parameters for validation and serving.

Correlated predictors can make individual coefficients unstable even when predictions remain adequate. Regularization can stabilize the fit, but a large coefficient still does not establish a causal effect. Most standard tree splits are less sensitive to feature scale, while missingness and category encoding still matter.

## Principal component analysis

Principal component analysis (PCA) finds orthogonal directions of high variance and projects centered data onto a chosen subset. Centering is part of the method; standardization is a modeling choice when feature units would otherwise dominate variance.

Suppose one sensor reports values around 100,000 and another around 0.1. PCA on unscaled measurements can devote most variance to the larger-scale sensor. Scaling changes the question from variance in original units to variation relative to each feature's fitted scale.

PCA uses input variance without the prediction target. A low-variance direction may contain the signal needed to detect a rare failure. Choose component count using downstream validation as well as explained variance. Fit the projection on training data so the test distribution does not influence the transformation.

Reducing retrieval vectors with a fitted projection also changes their distance geometry. Apply the same transform to query and document vectors, rebuild the affected index, and evaluate relevance. Truncating arbitrary embedding coordinates needs support from the encoder's design or empirical validation.

## Clustering groups observations without target labels

**K-means** alternates assigning points to nearby centroids and updating those centroids. Its objective minimizes within-cluster squared Euclidean distance. Feature scale, initialization and the selected number of clusters influence the result. Uneven densities, elongated clusters and outliers can make the partition misleading.

**Density-Based Spatial Clustering of Applications with Noise (DBSCAN)** groups points connected through dense neighborhoods and can label isolated points as noise. Its neighborhood radius and minimum-neighbor setting affect what counts as a cluster. One global density setting can struggle when populations have very different densities.

| Situation | Baseline to investigate | Check before trusting the groups |
|---|---|---|
| Compact groups with a chosen cluster count | K-means | Scaling, seed stability and outlier sensitivity |
| Irregular groups with noise | DBSCAN | Density variation and neighborhood sensitivity |
| Relationships at several resolutions | Hierarchical clustering | Distance metric, linkage and compute cost |

A silhouette score compares within-cluster cohesion with separation from other clusters. It can help compare distance-based partitions, but it cannot prove that a cluster represents a useful business category. Inspect examples, stability across samples and the decision the grouping will support.

For text or semantic vectors, normalization and distance choice affect clustering just as they affect retrieval. High-dimensional distances can become less discriminative. Validate the groups with domain examples before using them to route users, assign risk categories or partition a search corpus.

[Model selection and error analysis]({{ '/ml/fundamentals/model-selection-error-analysis/' | relative_url }}) covers splits and validation. [Feature preparation]({{ '/ml/features/feature-preparation-encodings/' | relative_url }}) covers the surrounding preprocessing.
