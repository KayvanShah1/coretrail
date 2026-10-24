---
title: "Partition pruning, clustering order, and layout costs"
description: "See when physical data organization reduces scans and when it creates overhead."
chapter: performance
order: 19
sequence: 1119
level: Intermediate
keywords:
  - "Partition pruning, clustering order, and layout costs"
interview_queries:
  - "explain partition pruning, clustering order, and layout costs"
references:
  - title: PostgreSQL CTE materialization
    url: https://www.postgresql.org/docs/current/queries-with.html#QUERIES-WITH-CTE-MATERIALIZATION
  - title: BigQuery performance guidance
    url: https://cloud.google.com/bigquery/docs/best-practices-performance-compute
---

Partitioning and clustering change which storage needs to be visited for a given predicate. Their value depends on actual filters, data distribution and write behavior. A table may be correctly partitioned yet still spend most of its time reading data, joining rows or waiting for compute.

## Partition pruning follows the partition key

Suppose a BigQuery table is partitioned by event_date and contains five years of events. A query restricted to seven days can skip irrelevant date partitions when the predicate is eligible for pruning.

~~~sql
SELECT asset_id, SUM(kwh) AS consumption
FROM analytics.meter_events
WHERE event_date >= DATE '2026-10-01'
  AND event_date < DATE '2026-10-08'
GROUP BY asset_id;
~~~

If the filter instead applies only to another timestamp field, the engine cannot assume it selects the same event_date partitions. Ingestion-time partitioning adds another distinction: a late-arriving event for Monday might physically land in Wednesday's ingestion partition.

A function around a partition key can sometimes prevent the expected pruning, depending on the engine and the exact expression. Check the execution plan or bytes scanned for the emitted SQL rather than asserting that every function causes a full scan.

## What clustering columns do

BigQuery clustering organizes storage blocks in the order of declared clustering columns. Filters on leading columns often improve block pruning most. A table clustered by (region, asset_id) is usually more useful for selective region queries than an otherwise identical table queried only by asset_id without region.

High cardinality is one input to the decision. If every report reads all regions, organizing blocks by region may provide little benefit. Small partitions can also leave little room for clustering to help.

## When more partitions make things worse

Partitioning adds metadata and layout constraints. Extremely fine granularity can create many tiny partitions. Small partitions increase metadata and management overhead, and may interact poorly with frequent inserts or compaction.

In PostgreSQL, too many child partitions can increase planning and maintenance work; unique constraints across a partitioned table must satisfy partition-key restrictions. In object-store analytics, excessive partition directories and small files can slow listing and scheduling. BigQuery has its own partition limits and partition-level overhead.

## A realistic redesign

A 40 TB sales table is mostly queried by date and store. Compare a date-partitioned, store-clustered version against the present layout on three real workloads: yesterday's sales, all history for one store, and a cross-store quarterly aggregate. Collect scanned bytes, slot-ms, latency and load cost. A layout that improves yesterday's dashboard might be worse for a rare full-history workload.

Migration must address backfill, historical corrections, retention, query compatibility, permissions and a cutover path. For the full incident, see [BigQuery slowdown and cost]({{ '/sql/performance/bigquery-workload-investigation/' | relative_url }}).
