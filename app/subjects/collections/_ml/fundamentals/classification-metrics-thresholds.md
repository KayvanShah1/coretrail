---
title: "Precision, recall, ROC-AUC and decision thresholds"
description: "Choose classification metrics according to prevalence, ranking quality, calibration and the operational cost of errors."
chapter: fundamentals
order: 2
sequence: 52
level: Core
math: true
keywords: [precision, recall, F1, F beta, ROC AUC, PR AUC, average precision, calibration, threshold, confusion matrix]
aliases: [classification evaluation, metric choice]
interview_queries: [when to use ROC AUC vs F1, why PR AUC for imbalanced data, does AUC mean accuracy]
references:
  - title: scikit-learn classification metrics
    url: https://scikit-learn.org/stable/modules/model_evaluation.html
---
A classifier may output a continuous risk score while an application needs a discrete action. Evaluating the score distribution and choosing the action threshold are different decisions. Class prevalence, the number of decisions users can review and the cost of each error determine which metric is informative.

## Start with the confusion matrix

Suppose 100 of 1,000 projects are genuinely high risk. The model flags 120, correctly identifying 80. This gives 80 true positives (TP), 40 false positives (FP), 20 false negatives (FN) and 860 true negatives (TN).

{% include math.html tex="\mathrm{Precision}=\frac{TP}{TP+FP}=\frac{80}{120}=0.667" block=true %}
{% include math.html tex="\mathrm{Recall}=\frac{TP}{TP+FN}=\frac{80}{100}=0.8" block=true %}
{% include math.html tex="\mathrm{F1}=\frac{2PR}{P+R}\approx0.727" block=true %}

Accuracy is 94%, mostly because negatives are numerous. If only 1% of examples are positive, predicting everything negative achieves 99% accuracy while detecting no positives.

Precision answers how trustworthy a positive alert is. Recall answers how many actual positives are found. The harmonic mean F1 summarizes both at **one threshold**, without incorporating true negatives or unequal business costs. F-beta weights recall more heavily when beta exceeds one and precision more heavily when beta is below one.

## ROC-AUC measures discrimination across thresholds

The receiver operating characteristic (ROC) curve plots true-positive rate against false-positive rate at varying thresholds.

{% include math.html tex="\mathrm{TPR}=\frac{TP}{TP+FN},\quad \mathrm{FPR}=\frac{FP}{FP+TN}" block=true %}

Area under the ROC curve (ROC-AUC) describes how often a random positive receives a higher score than a random negative, with half credit for ties. An ROC-AUC of 0.89 means good *ranking discrimination*; it is not 89% accuracy and gives no operating threshold.

## Rare positives change the practical picture

Consider 100 frauds among 100,000 transactions. At 90% true-positive rate and 1% false-positive rate, the classifier catches 90 frauds but raises approximately 999 false alarms. Precision becomes about 8.3%. The precision-recall (PR) curve exposes this operational burden more directly.

Average precision (AP) summarizes precision at successive positive-result ranks and differs from trapezoidal PR-AUC. Its random-ranking baseline is related to positive prevalence. Compare AP on datasets with comparable populations.

| Requirement | Useful evaluation |
|---|---|
| Fixed review capacity of 100 alerts | Precision@100, Recall@100 |
| Detect nearly all dangerous cases | Recall with maximum false-positive budget |
| Compare discrimination before threshold choice | ROC-AUC, PR-AUC/AP |
| Balance positive precision and recall | F1/F-beta at validated threshold |
| Decisions depend on probability | Log loss, Brier score and calibration |
| Unequal financial consequences | Expected cost and threshold-specific confusion matrix |

## Threshold and probability quality

A common 0.5 threshold has no special optimality for many real applications. Choose the decision threshold on validation data using business loss, allowed alert volume or target recall. Reserve the holdout test set for an independent estimate.

{% include math.html tex="\mathrm{ExpectedCost}=C_{FP}\,FP+C_{FN}\,FN" block=true %}

Calibration asks whether predicted probabilities match observed outcome frequency. A model can rank well and remain poorly calibrated; Platt scaling or isotonic calibration may help when evaluated on appropriate held-out data. Delayed labels and population shifts can alter apparent calibration.

Multi-class problems require explicit averaging conventions (micro, macro or weighted) and attention to which class matters. Read [validation and leakage]({{ '/ml/fundamentals/validation-leakage-trees/' | relative_url }}) for sound splits and [survival/time-to-event models]({{ '/ml/fundamentals/xgboost-lstm-survival/' | relative_url }}) when an event's timing matters.
