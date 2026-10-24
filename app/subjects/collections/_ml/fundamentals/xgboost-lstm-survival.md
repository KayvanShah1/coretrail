---
title: "Gradient boosting, LSTM and survival prediction"
description: "Compare tree ensembles with recurrent time-series models and explain censoring and time-to-event evaluation."
chapter: fundamentals
order: 3
sequence: 53
level: Intermediate
math: true
keywords: [XGBoost, gradient boosting, LSTM, recurrent network, survival model, censoring, hazard, concordance index]
aliases: [XGBoost vs LSTM, time to event, tree boosting]
interview_queries: [why choose XGBoost rather than LSTM, how does an LSTM survival model work]
references:
  - title: XGBoost tree boosting tutorial
    url: https://xgboost.readthedocs.io/en/stable/tutorials/model.html
---
A static risk snapshot and the trajectory leading up to it carry different information. Two projects may have the same cost overrun today; one deteriorated gradually while the other changed abruptly. A tabular model can compare their present features, while a sequence model can learn the pattern of preceding observations.

## XGBoost and additive trees

A decision tree splits feature space into regions. A random forest fits largely independent trees to randomized data and features, then averages predictions or votes. Gradient boosting adds trees sequentially to improve the current ensemble.

{% include math.html tex="\hat y_i^{(t)}=\hat y_i^{(t-1)}+\eta f_t(x_i)" block=true %}

XGBoost uses gradients and second derivatives (Hessians) of the chosen loss to estimate the gain from candidate splits. Regularization penalizes excessive leaves or large leaf scores. A split on cost deviation can interact with contractor category or project stage without hand-writing all pairwise feature combinations.

Tree ensembles suit structured mixed-feature datasets and can be strong with moderate amounts of data. Explain a prediction with feature attribution cautiously: SHapley Additive exPlanations (SHAP) contributions describe the fitted model, not causal effects. Training cost, class imbalance, temporal validation and calibration still matter.

When time influences the target, lag features and rolling changes can supply the history to a boosted tree. This is a substantial baseline before adopting a recurrent network.

## Long Short-Term Memory (LSTM)

An LSTM reads a sequence of observations. It maintains a hidden state and cell state, with gates that control retaining prior information, adding new candidate content and exposing updated information.

{% include math.html tex="f_t=\sigma(W_f[h_{t-1},x_t]+b_f)" block=true %}
{% include math.html tex="c_t=f_t\odot c_{t-1}+i_t\odot\tilde c_t" block=true %}

Here the forget gate `f_t` controls retained memory, the input gate `i_t` controls new candidate information and `⊙` denotes elementwise multiplication. The recurrent design can learn temporal changes without manually enumerating every lag. Irregular observation intervals, missing values, small training sets and sequence truncation complicate training.

A Transformer or temporal convolutional network can be a useful alternative for long histories, but a sequence model needs an observed quality gain over the simpler baseline.

## Survival analysis predicts time to an event

For a project still operating when observation ends, its eventual failure time is unknown. This right-censored observation tells us the project survived until the last recorded time; it is not an ordinary negative class.

{% include math.html tex="S(t)=P(T>t)" block=true %}

The survival function measures probability of surviving beyond time `t`. The hazard measures the event rate conditional on survival so far. A survival training objective uses both observed event times and censoring information. An LSTM feeding an ordinary binary classifier does not automatically constitute a survival model.

| Model | Good starting condition | Assumption or cost |
|---|---|---|
| Cox proportional hazards | Interpretable relationships, suitable event-time data | Proportional hazard assumption |
| Accelerated Failure Time | Parametric survival-time modeling | Distribution assumptions |
| Random Survival Forest | Nonlinear tabular survival predictors | Less direct raw sequence modeling |
| XGBoost survival objective | Tabular features and boosting flexibility | Requires correct objective and censoring design |
| LSTM survival | Meaningful evolving histories | More data and sequence-model complexity |

Use concordance index to study comparable risk orderings; use time-dependent receiver operating characteristic area under the curve (ROC-AUC) and calibrated survival estimates at specific horizons. A standard binary ROC-AUC only describes a fixed event classification target. Define the event, horizon and censoring treatment before quoting a metric.

Time-aware splits matter because earlier project snapshots can otherwise borrow information from future outcomes. For general classification thresholds, see [precision, recall and AUC]({{ '/ml/fundamentals/classification-metrics-thresholds/' | relative_url }}).
