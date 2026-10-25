---
title: "One Big Table, dimensional models and ML training grain"
description: "Choose a wide table, star schema or feature history according to query workload and required time semantics."
chapter: modelling
order: 5
sequence: 155
level: Core
keywords:
  - One Big Table
  - OBT
  - star schema
  - feature table
  - training grain
  - dimensional modeling
interview_queries:
  - one big table vs star schema
  - can a wide table be a feature store
  - why does training row grain matter
---

One Big Table (OBT) is a deliberately denormalized table that places frequently consumed attributes beside a fact or entity at one defined grain. It can simplify an analyst's query and reduce repeated joins. The repeated values and update obligations still exist somewhere in the pipeline.

## Define the row before choosing the shape

A fraud training row might represent one transaction. An electricity forecast training row could represent `(plant_id, prediction_time, horizon)`. Mixing horizons or joining a one-to-many event table to a transaction table can duplicate the same label and distort model training.

| Representation | Works well when | Cost to expect |
|---|---|---|
| Wide OBT | Consumers repeatedly need the same joined attributes | Duplicated dimensions, frequent rebuilds or update complexity |
| Star schema | Many analytical measures share conformed dimensions | Joins and grain-aware modeling for every query |
| Feature snapshot table | Models need reproducible attributes at a given time | Versioning, feature freshness and as-of joins |
| Online feature store | Models need keyed low-latency current values | Materialization jobs and operational consistency |

A warehouse can efficiently scan a well-clustered wide table. It may also efficiently join fact and dimension tables. Measure actual workload, storage growth and maintenance cost before assuming fewer joins always wins.

## The changing-dimension problem

Suppose an OBT records a transaction alongside the customer's region. When that region changes, should all historical transactions show the new region or the region when the transaction happened? Both are legitimate business questions with different answers.

A star schema may represent this using a slowly changing dimension and effective dates. A training dataset must select the appropriate historical dimension version using the prediction cutoff and availability rules.

Blindly joining the latest customer table into old training examples can leak future information even if the SQL is otherwise correct.

## Is OBT a feature store?

A wide table may hold all features needed by one training job. Feature stores additionally address reused definitions, historical feature versions, point-in-time joins and possibly low-latency online serving.

A reasonable small-system design is a versioned warehouse feature table plus a deterministic training dataset build. Add a separate online store when the model's serving latency and freshness requirements demand it.

Physical storage follows the [consumer access pattern]({{ '/data-engineering/storage/workload-storage-selection/' | relative_url }}); the row grain follows the prediction or reporting task.

Continue with [Point-in-time feature construction]({{ '/ml/features/point-in-time-features/' | relative_url }}) and [dimensional modelling]({{ '/data-engineering/modelling/dimensional-facts-schemas/' | relative_url }}).
