---
title: "BigQuery execution, partitioning, clustering, and cost"
description: "Diagnose stage-level work and explain how physical layout changes scans."
chapter: gcp
order: 1
sequence: 401
level: Core
keywords:
  - BigQuery execution, partitioning, clustering, and cost
interview_queries:
  - explain bigquery execution, partitioning, clustering, and cost
---

BigQuery separates managed analytical storage from query compute. Column-oriented storage allows column projection and compression. A query planner builds distributed stages; workers process partitions and exchange intermediate rows through shuffle. Slots represent compute capacity, while slot-ms measures compute use over time.

## A slow query

When a query grows from five seconds to forty seconds, compare it with an earlier successful job. Look for input growth, changed predicates, extra join rows, new shuffle stages, concurrency or queueing, and storage pruning. Inspect job history and the execution graph before assuming the answer is more slots.

~~~sql
SELECT job_id, total_bytes_processed, total_slot_ms,
       TIMESTAMP_DIFF(end_time, start_time, SECOND) AS runtime_s
FROM `region-us`.INFORMATION_SCHEMA.JOBS_BY_PROJECT
WHERE creation_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 DAY)
  AND job_type = 'QUERY' AND state = 'DONE'
ORDER BY total_slot_ms DESC
LIMIT 20;
~~~

Replace `region-us` with the region where your BigQuery jobs ran, and use appropriate permissions.

## Partitioning and clustering

Partitioning separates rows by a key such as an event date. A qualifying filter can skip entire partitions. Clustering organizes storage blocks by selected columns, allowing selective block pruning. The leading clustering columns usually matter most.

~~~sql
CREATE TABLE analytics.orders (
  customer_id STRING, order_ts TIMESTAMP, amount NUMERIC
)
PARTITION BY DATE(order_ts)
CLUSTER BY customer_id;
~~~

Filtering a week of order dates can prune partitions; selecting a customer may further reduce scanned blocks. LIMIT does not generally promise a small scan. SELECT * can read unnecessary columns. A common table expression is not automatically a materialized cache.

## Cost investigation

In an assessment scenario, a 40 TB table was partitioned by a store-derived hash despite repeated queries filtering by date. A 42 GB query executed 1,400 times processes roughly 58.8 TB per day. Query frequency matters as much as per-run size. Check whether billing uses on-demand bytes or capacity-based slots before estimating savings.

Test alternative date partitions, clustering and summary tables with representative jobs. Validate correctness and downstream compatibility before a migration; the migration itself consumes resources.
