---
title: "Regression and time-series forecasting evaluation"
description: "Compare MAE, RMSE, WAPE, MAPE, RMSSE, bias and monetary loss across forecast horizons without temporal leakage."
chapter: fundamentals
order: 4
sequence: 54
level: Intermediate
math: true
mermaid: true
keywords: [MAE, RMSE, MSE, MAPE, WAPE, MASE, RMSSE, forecast bias, rolling validation]
aliases: [forecast accuracy metrics, regression model metrics]
interview_queries: [MAE vs RMSE, why MAPE fails near zero, how to backtest forecasting models]
references:
  - title: Forecasting Principles and Practice, accuracy measures
    url: https://otexts.com/fpp3/accuracy.html
---
A forecast of electricity use, inventory demand or transaction volume is often evaluated long before the eventual business decision. The metric changes which mistakes a model is incentivized to avoid. A model that minimizes typical hourly error can still be expensive if its largest misses occur during high-price periods.

## Absolute and squared error

For actual value {% include math.html tex="y_t" %} and prediction {% include math.html tex="\hat y_t" %}, define the residual as actual minus forecast. Mean absolute error (MAE) treats every unit of error linearly:

{% include math.html tex="\mathrm{MAE}=\frac{1}{n}\sum_{t=1}^{n}|y_t-\hat y_t|" block=true %}

Root mean squared error (RMSE) squares errors before averaging:

{% include math.html tex="\mathrm{RMSE}=\sqrt{\frac{1}{n}\sum_{t=1}^{n}(y_t-\hat y_t)^2}" block=true %}

For four hypothetical forecast errors of 1, 1, 1 and 9 MW, MAE is 3 MW and RMSE is approximately 4.58 MW. RMSE gives unusually large deviations more influence. That is desirable if expensive peak-hour misses warrant additional attention; it can also shift the model toward outliers that are unreliable or rare.

**Mean squared error (MSE)** is useful as a differentiable optimization loss, but its units are squared. Reporting RMSE restores the original units. Compare error distributions, not just overall means.

## Percentage metrics and zero demand

Mean absolute percentage error (MAPE) divides each absolute error by its actual value. A tiny actual load can create a huge percentage and a zero actual value makes the expression undefined.

{% include math.html tex="\mathrm{WAPE}=\frac{\sum_t|y_t-\hat y_t|}{\sum_t|y_t|}" block=true %}

Weighted absolute percentage error (WAPE) aggregates absolute errors before dividing by total absolute demand. This is easier to interpret for positive-volume series, but becomes undefined when total actual demand is zero and can change with the evaluation period's volume composition.

Scaled metrics such as mean absolute scaled error (MASE) and root mean squared scaled error (RMSSE) compare error against a naive baseline fitted on the **training** period. They help across heterogeneous series, provided the baseline denominator is defined and meaningful.

| Metric | Strength | Failure to inspect |
|---|---|---|
| MAE | Unit-scale, robust to isolated large errors | May underweight rare expensive peaks |
| RMSE | More sensitive to large misses | Can be dominated by outliers |
| MAPE | Relative error on positive, nonzero targets | Unstable or undefined near zero |
| WAPE | Ratio of total absolute miss to observed volume | Sensitive to time range and volume mix |
| MASE / RMSSE | Scales against a naive forecast | Depends on baseline and training history |
| Mean error (bias) | Direction of systematic over/underprediction | Positive and negative errors cancel |

{% include math.html tex="\mathrm{Bias}=\frac{1}{n}\sum_t(\hat y_t-y_t)" block=true %}

Bias matters where systematic underprediction creates procurement penalties even when mean absolute error remains stable.

## Evaluate the horizon and the decision

A system publishing every 15 minutes may produce forecasts for the next 15, 30, 60 or 180 minutes. Record the **issue time**, **target time** and **horizon** on every prediction. Do not pool their scores without reporting the horizon mix.

{% capture diagram_code %}
flowchart LR
A["Issue at 10:00 using available weather forecast"] --> B["Predict demand at 10:15"]
A --> C["Predict demand at 11:00"]
B --> D["Join actual at 10:15 after arrival"]
C --> E["Join actual at 11:00 after arrival"]
D --> F["Horizon-specific MAE / bias"]
E --> F
F --> G["Procurement or capacity loss"]
{% endcapture %}
{% capture diagram_fallback %}
Forecast issued at 10:00 produces predictions for future target times. Each prediction joins actuals only after they arrive; error is grouped by horizon and compared with procurement or capacity loss.
{% endcapture %}
{% include diagram.html title="A forecast origin produces several separately scored horizons" code=diagram_code fallback=diagram_fallback caption=true %}

Use rolling-origin backtesting: train on past history, predict a later block, advance the origin, and repeat. Fit imputers, normalization and target transformations within each training window. Weather forecasts should reflect what the weather provider knew at the original issue time; substituting observed future weather makes the backtest unrealistically accurate.

## Translate accuracy to business impact

An electricity trader may care about deviations multiplied by settlement prices, with asymmetric penalties for buying too little versus too much. A retailer may care about stockouts and holding costs. Compare a candidate model against a seasonal-naive or last-observed baseline on both statistical and business metrics.

Break down residuals by site, hour, season, holiday, load range and missing-data condition. An apparently strong global RMSE can conceal a model that fails precisely on expensive or difficult subgroups.

For temporal features see [point-in-time feature joins]({{ '/ml/features/point-in-time-features/' | relative_url }}); for data-arrival correctness see [event time and watermarks]({{ '/data-engineering/processing/spark-beam-and-time/' | relative_url }}).
