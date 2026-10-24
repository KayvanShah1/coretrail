---
title: "BigQuery slowdown and cost: work from job evidence"
description: "Diagnose expensive SQL using job history, scan volume, slots, query frequency, and execution stages."
chapter: performance
order: 16
sequence: 1116
level: Intermediate
keywords:
  - "BigQuery slots"
  - "slot-ms"
  - "INFORMATION_SCHEMA.JOBS_BY_PROJECT"
  - "query plan"
  - "40 TB sales table"
  - "partition pruning"
interview_queries:
  - "why did a BigQuery query go from five seconds to forty seconds"
  - "a BigQuery bill doubled which workload do you investigate first"
references:
  - title: "BigQuery query plan"
    url: https://cloud.google.com/bigquery/docs/query-plan-explanation
  - title: "JOBS metadata"
    url: https://cloud.google.com/bigquery/docs/information-schema-jobs
  - title: "Partition pruning"
    url: https://cloud.google.com/bigquery/docs/querying-partitioned-tables
  - title: "Clustering"
    url: https://cloud.google.com/bigquery/docs/clustered-tables
---

A query that ran in five seconds now takes forty, while another team reports that BigQuery spending has doubled. The same metric does not explain both incidents. Job history, the execution graph and the billing model establish which hypothesis can explain the change.

## Compare with a known-good run

Record the SQL, parameters, table sizes, cache status, start and end times, bytes processed, bytes billed and slot-milliseconds (slot-ms) for a working and slow execution. A slot represents abstract processing capacity, including compute and related resources. Slot-ms measures capacity consumed over time and is distinct from elapsed wall-clock time.

Use the project jobs view in the relevant BigQuery location:

~~~sql
SELECT
  job_id,
  user_email,
  creation_time,
  start_time,
  end_time,
  cache_hit,
  total_bytes_processed,
  total_bytes_billed,
  total_slot_ms,
  TIMESTAMP_DIFF(end_time, start_time, SECOND) AS runtime_seconds
FROM `region-us`.INFORMATION_SCHEMA.JOBS_BY_PROJECT
WHERE creation_time >= TIMESTAMP_SUB(
  CURRENT_TIMESTAMP(), INTERVAL 7 DAY
)
  AND job_type = 'QUERY'
  AND state = 'DONE'
ORDER BY total_slot_ms DESC
LIMIT 50;
~~~

Replace the location qualifier with the actual region; the rendered example uses region-us. The view requires appropriate job metadata permissions. A DONE job may still have an error, so check error_result when investigating failures.

An increase in creation-to-start time can reflect waiting or scheduling; it does not prove slot contention without corroborating reservation or capacity data.

## Read the execution graph

Large READ work suggests expensive input scans or missing pruning. A JOIN producing many more rows than expected may indicate duplicate matching keys. A shuffle stage with substantial intermediate data or uneven processing can reveal skew or spills. Query planner decisions may change as data distributions change; BigQuery can dynamically repartition work.

Check partition predicates and clustering filters, unused SELECT * columns, cache differences, aggregation cardinality and repeatedly computed intermediates. Keep the result grain and correctness checks unchanged while testing one optimization at a time.

## The 40 TB sales-table exercise

Consider three queries from an assessment scenario:

| Query | Runs/day | Scan/run | Scanned/day | Slot-ms/run | Slot-ms/day |
|---|---:|---:|---:|---:|---:|
| q_101 | 4 | 11.2 TB | 44.8 TB | 980,000 | 3,920,000 |
| q_102 | 1,400 | 42 GB | 58.8 TB | 12,000 | 16,800,000 |
| q_103 | 6 | 0.9 TB | 5.4 TB | 2,100,000 | 12,600,000 |

The daily scan comparison assumes consistent decimal units. The three queries process approximately 109 TB daily. q_102 has the largest aggregate scanned volume because it is repeated 1,400 times. It also has the highest daily slot-ms. q_103 consumes substantial compute for relatively little scanned data, so its joins, shuffle and other processing operations deserve investigation.

Neither scanned volume nor slot-ms in this hypothetical table is the actual invoice. For on-demand pricing, determine billed bytes and applicable query charges. For capacity-based pricing, inspect reserved and autoscaled slot capacity, commitments, concurrency and utilization. Consult billing export data before attributing a spending increase to one query.

## Partitioning and clustering are workload decisions

The assessment describes a 40 TB historical sales table organized around a store-derived hash, while an important query filters for yesterday's sales. Verify the real table definition before recommending changes: BigQuery does not support unrestricted expression-based hash partitioning in the same manner as every relational database. A date-partitioned replacement would allow a suitable date filter to prune old partitions; clustering by a commonly filtered store field may help prune storage blocks inside partitions.

Avoid rewriting 40 TB based solely on one query. Investigate q_102's excessive refresh frequency, possible materialized summaries, q_101's partition pruning, and q_103's expensive execution stages. Measure representative queries in both layouts and include migration, freshness and maintenance costs.

## Before calling an optimization successful

Check row counts and business totals, bytes processed, slot-ms, query duration, cache state, and downstream dependencies. A faster query returning the wrong rows is not a successful optimization. A migration also needs permissions, dependency compatibility, a staged cutover, and a rollback or correction plan.

For cross-engine differences, see [Warehouse performance: BigQuery, Redshift, Athena]({{ '/sql/performance/warehouses/' | relative_url }}), and for general diagnosis see [When and where to optimize]({{ '/sql/performance/workflow/' | relative_url }}).
