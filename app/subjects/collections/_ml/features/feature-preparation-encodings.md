---
title: "Numerical and categorical feature preparation"
description: "Fit transformations on training data, choose categorical encodings, and diagnose features that change meaning between environments."
chapter: features
order: 1
sequence: 101
level: Core
math: true
keywords:
  - feature engineering
  - standardization
  - one hot encoding
  - target encoding
  - out of fold
interview_queries:
  - why does target encoding cause leakage
  - do tree models need scaling
  - how do you prevent preprocessing leakage
---

A preprocessing operation becomes a model assumption when it is fitted using a particular population. If the model was trained with one definition of a missing value, category or aggregation window, serving must produce the same meaning.

## Numerical features

Standardization uses the training mean and standard deviation:

{% include math.html tex="z=\frac{x-\mu_{\mathrm{train}}}{\sigma_{\mathrm{train}}}" block=true %}

The mean and standard deviation must be learned within each training fold. Computing them on the full dataset before cross-validation exposes information from validation examples. The same applies to imputation statistics, feature selection and dimensionality-reduction transforms.

Min-max scaling uses the training minimum and maximum. Production values can fall outside the original range; clipping them is a separate modeling decision. For heavily skewed nonnegative monetary values, a transformation such as `log1p(x)` may help a linear model. Check what the transformation does near zero and on unexpected negative values.

Tree splits depend on feature ordering. Applying a monotonic scaling to a numerical feature generally leaves the candidate splits equivalent, so standardization rarely improves a basic tree ensemble. Linear models, neural networks and distance-based models are more sensitive to scale.

## Categorical values carry different assumptions

| Method | What the model receives | Failure to test |
|---|---|---|
| One-hot | A column per category | Unseen categories and very wide sparse inputs |
| Ordinal | Ordered numeric codes | Artificial order for nominal values |
| Count/frequency | Historical occurrence statistic | Category frequency changes with traffic |
| Hashing | A fixed number of hashed columns | Collisions and difficult interpretation |
| Learned embedding | Dense trainable representation | Rare categories with too little supervision |
| Target encoding | Smoothed historical target statistic | Leakage from current/future labels |

Suppose a merchant category has only two labeled fraudulent transactions. Its raw fraud rate can be extremely unstable. A smoothed target encoding shrinks that estimate toward a global prior. The prior and category estimates must still come from allowed training data.

### Why ordinary target encoding can be wrong

If you replace a training row's merchant ID with the fraud rate calculated from **all** rows for that merchant, that row's own label influences its input. A high-cardinality identifier can then behave like a near-lookup of the answer.

Out-of-fold encoding avoids giving a training example its own target statistic. In temporal settings, even ordinary out-of-fold splits may leak future labels; fit a past-only encoding at each prediction cutoff.

## Missingness has operational meaning

A missing temperature forecast may mean a provider outage. A missing income field may be part of the underlying customer population. Investigate the cause before imputation. A missingness indicator can help if absence carries predictive signal, but a suddenly rising null rate could instead be a broken join.

For categorical values, define unknown and missing categories explicitly. For numerical fields, version the imputer together with the model. Native missing-value handling in tree engines is another option.

## Practical feature contract

For each feature, record its entity key, type, aggregation grain, timestamp semantics, null handling, update frequency, owner and serving availability. Train and inference code should share fitted parameters or verify equivalent outputs.

A useful integration test runs the same sample entities through the offline pipeline and online transformation, then compares values and timestamps. If the discrepancy only appears after deploying a new encoder, the model may be healthy while its inputs have changed.

Next: [Point-in-time joins]({{ '/ml/features/point-in-time-features/' | relative_url }}).
