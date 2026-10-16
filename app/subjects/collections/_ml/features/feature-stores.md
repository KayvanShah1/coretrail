---
title: "Offline and online feature stores"
description: "Decide when historical features, online materialization and shared definitions justify feature-store infrastructure."
chapter: features
order: 3
sequence: 63
level: Core
mermaid: true
keywords:
  - feature store
  - offline store
  - online store
  - Feast
  - training serving skew
  - feature freshness
interview_queries:
  - offline vs online feature stores
  - what is training serving skew
  - can BigQuery be a feature store
---

A model can train on warehouse history and still require a low-latency lookup during prediction. Offline and online stores serve these different access patterns.

{% capture diagram_code %}
flowchart LR
A["Raw events / source tables"] --> B["Versioned feature transformations"]
B --> C["Offline history: warehouse / lake"]
B --> D["Materialization"]
D --> E["Online store: keyed latest values"]
C --> F["Point-in-time training join"]
E --> G["Online prediction"]
F --> H["Model artifact"]
H --> G
{% endcapture %}
{% capture diagram_fallback %}
Raw events feed versioned transformations. Offline historical features feed point-in-time training joins; selected current features are materialized to an online keyed store for prediction. The trained model consumes both according to the same definitions.
{% endcapture %}
{% include diagram.html title="Historical training and low-latency online reads" code=diagram_code fallback=diagram_fallback caption=true %}

## Offline features answer historical questions

A warehouse or lakehouse can retain a long history of feature values, supporting training, backtesting and reproducibility. Queries may scan many entities and timestamps. A correct offline feature lookup reconstructs what was available at each training event.

## Online features answer current requests

An online store supports low-latency key lookups such as `customer_id → txn_count_24h, avg_spend_7d`. Materialization moves or computes current values into a serving store. It requires monitoring because the materialized view can lag behind the source.

A feature's required freshness must be defined before selecting the store. A five-minute-old product preference might be acceptable for recommendations and unacceptable for a transaction-velocity fraud rule.

## Training-serving skew

If the training pipeline computes a seven-day window in SQL using one timezone convention, while a Python service computes a rolling seven days using another, model inputs differ. This is training-serving skew.

Reuse transformations where possible, version definitions and compare offline/online values for sampled entities. A shared feature store reduces repeated implementation, but cannot guarantee semantic parity when ingestion and materialization behave differently.

## Does every model need one?

A single batch prediction model using a curated BigQuery table may have no reason to maintain another serving infrastructure. A warehouse plus versioned transformation jobs can suffice. A store becomes attractive when multiple models reuse the same features, real-time inference needs fast lookups or historical consistency is difficult to maintain.

Define behavior for stale or unavailable online features. Options include an approved cached value, fallback model, deferred decision or explicit failure. Silent default zeros can turn a provider outage into systematic model error.

A **One Big Table** can supply a training dataset without providing historical feature-version management or online serving. See [One Big Table and training grain]({{ '/data-engineering/storage/one-big-table-feature-data/' | relative_url }}) for that distinction.

Next: [MLOps and model monitoring]({{ '/ml/operations/overview/' | relative_url }}).
