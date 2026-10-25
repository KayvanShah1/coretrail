---
title: "Point-in-time joins and availability leakage"
description: "Recreate the features a model could have observed at a historical prediction timestamp, including delayed events."
chapter: features
order: 2
sequence: 62
level: Core
math: true
keywords:
  - point in time join
  - data leakage
  - event time
  - ingestion time
  - late arriving data
  - as of join
references:
  - title: Feast point-in-time joins and backfilled corrections
    url: https://docs.feast.dev/getting-started/concepts/point-in-time-joins
interview_queries:
  - how do you prevent data leakage in feature engineering
  - why is event time not enough for a point in time join
  - how do feature stores recreate training examples
---

A late-arriving event can make a historical training row look more informed than the corresponding production prediction was. Joining by event time alone misses this problem.

{% include diagnostic-map.html id="point-in-time" %}

## Availability and observation time answer different questions

**Availability time** records when a production predictor could read a feature version. Every selected value must have been available by the prediction cutoff. For a feature derived from observed historical events, the observations must also precede that cutoff:

{% capture validity %}
t_{\mathrm{event}}\le t_{\mathrm{predict}}\quad\text{and}\quad t_{\mathrm{available}}\le t_{\mathrm{predict}}
{% endcapture %}
{% include math.html tex=validity block=true %}

Availability might reflect the ingestion of an external provider's update or publication of a materialized aggregate. The event-time condition above applies to **observed-history features**. A future-known covariate uses different time semantics: a provider's weather forecast targeting 14:00, issued and available at 12:00, can be used for a 13:00 prediction. Its target time is in the future while its issue and availability times are in the past. The actual 14:00 weather reading remains unavailable at 13:00.

Store forecast issue time, target time and availability separately. For calendar features, a known future holiday can also be valid input. Applying an observed-event cutoff blindly to every timestamp would discard legitimate future-known information.

## A PostgreSQL point-in-time lookup

Assume an append-only feature history: `customer_id`, `event_time`, `available_at`, `txn_count_24h`. Each version was computed using only the data available at its publication time.

```sql
SELECT p.customer_id, p.prediction_at, f.txn_count_24h
FROM prediction_examples AS p
LEFT JOIN LATERAL (
  SELECT txn_count_24h
  FROM feature_history AS f
  WHERE f.customer_id = p.customer_id
    AND f.event_time <= p.prediction_at
    AND f.available_at <= p.prediction_at
  ORDER BY f.event_time DESC, f.available_at DESC
  LIMIT 1
) AS f ON true;
```

The lateral join returns the newest eligible value per prediction. Indexing by entity and relevant timestamps can make this feasible at moderate scale; large training datasets often use dedicated point-in-time join execution in a warehouse or feature platform.

A later correction to an old observation may be backdated in event time. Immutable version records and availability timestamps reconstruct what was originally visible. Check a feature platform's exact semantics: Feast documents that its default point-in-time join constrains event timestamps, while a creation timestamp can choose the latest correction without independently enforcing an availability cutoff.

## Aggregates also leak

A 24-hour transaction count can accidentally include events arriving after the prediction. Historical snapshots must preserve which events were eligible when the aggregate was calculated. Recomputing today's corrected history and joining it to old predictions can silently introduce hindsight.

Labels need their own maturity window. For fraud detection, the absence of a chargeback one day after a transaction may mean the label is still unknown. Training only on mature examples avoids misclassifying delayed outcomes.

## Split by how the model will operate

A time-based split prevents training on later periods, while entity/group splits help avoid repeats of the same customer or document. With sliding windows and correlated observations, choose a gap or embargo if adjacent examples share future label information.

For power forecasting, preserve the forecast *issued before* the target hour, not the actual later weather value. For fraud, preserve the transaction-velocity estimate the scorer could fetch when the payment arrived.

If offline validation is excellent and live results degrade, inspect a sample of training examples and replay their features at the original timestamps before deciding to retrain.

Next: [Offline and online feature stores]({{ '/ml/features/feature-stores/' | relative_url }}).
