---
title: "Diagnosing data failures from symptoms and evidence"
description: "Separate semantic corruption, freshness lag, resource bottlenecks and publication failures before choosing a repair."
chapter: "reliability"
order: 4
sequence: 704
level: "Core"
mermaid: true
keywords: ["pipeline troubleshooting","fanout","SCD overlap","data freshness","small files","skew","checkpoint gap","reconciliation","diagnosis"]
interview_queries: ["pipeline succeeds but data is wrong","how to diagnose data pipeline lag"]
last_verified: "2026-10-25"
references: [{"title":"Spark SQL performance tuning","url":"https://spark.apache.org/docs/latest/sql-performance-tuning.html"},{"title":"BigQuery quota troubleshooting","url":"https://docs.cloud.google.com/bigquery/docs/troubleshoot-quotas"},{"title":"Delta concurrency conflicts","url":"https://docs.delta.io/concurrency-control/"},{"title":"PostgreSQL monitoring and locks","url":"https://www.postgresql.org/docs/current/monitoring-stats.html"},{"title":"Kimball Type 2 history","url":"https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-2/"}]
---

A query becomes slow, a report changes or a pipeline falls behind. Begin by defining the expected grain, coverage and freshness, then compare a known-good release with the failing one. Several different failures can produce the same symptom.

## First distinguish wrong, late and unavailable


{% capture diagram_2 %}
flowchart TD
S["Reported data problem"] --> C{"Values wrong, data late or service unavailable?"}
C -- "Wrong values" --> V["Trace keys, joins, versions and units"]
C -- "Late data" --> L["Locate source, queue, compute or sink delay"]
C -- "Unavailable" --> A["Inspect dependency errors, locks and capacity"]
V --> E["Compare manifests and affected cohorts"]
L --> E
A --> E
E --> H["Test one explanation against observed evidence"]
H --> R["Bounded repair and reconciliation"]
{% endcapture %}
{% capture fallback_2 %}
Classify the problem as incorrect data, freshness lag or unavailability. Trace the relevant path, compare releases and test a specific explanation before bounded repair.
{% endcapture %}
{% include diagram.html title="Narrow the failure before repeating work" code=diagram_2 fallback=fallback_2 caption=true %}


Preserve failed input, manifests and query/commit identifiers before clearing tasks or deleting staging data. A repair can erase the evidence needed to explain what happened.

## Symptoms, discriminating evidence and possible fixes

| Symptom | Evidence that narrows the cause | Candidate repair |
|---|---|---|
| Totals increase after a descriptive join | Row counts and measures before/after each join; key uniqueness | Fix fanout, preaggregate children or correct temporal matches |
| Old sales move to a new region | Dimension join path, validity and current-row filters | Use event-valid versions or deliberately restate history |
| Repeated reruns increase row count | Event IDs, sink keys, batch operation IDs | Deduplicate and make replay converge |
| Newer values revert after a backfill | Applied source versions and overlapping writers | Reject stale versions or isolate publication |
| Tasks succeed but data is incomplete | Missing source IDs, pagination, rejected counts and interval coverage | Repair extraction and completeness checks |
| Backlog rises while workers appear busy | Arrival/commit rates, sink throttling and partition distribution | Remove the actual bottleneck and bound retries |
| One task remains slow | Per-key/partition size, skew and spill | Rebalance or use valid partial aggregation |
| Planning is slow with low compute use | File/manifest counts and metadata service latency | Compact and maintain metadata using supported operations |
| Merge latency grows sharply | Files/bytes touched and concurrent conflicts | Improve pruning/layout and reduce conflicting write scopes |
| Query time varies despite similar bytes | Queue time, competing jobs, locks and memory spill | Address concurrency, blockers or resource allocation |
| Old table snapshot fails | Cleanup history and missing referenced files | Restore retained objects or rebuild a valid release |
| Resume fails or skips records | Checkpoint version, source retention and cursor lineage | Restore compatible state or perform a verified resnapshot |

These are hypotheses. A hot key and a throttled sink can both create long tasks, while adding workers only helps one of them. Use evidence to choose.

## Worked example: revenue doubles

An order has three lines and two payment attempts. Joining both children to the order creates six combinations. An aggregate over line revenue now counts each line twice.

Check uniqueness at the intended grain before aggregation:

~~~sql
SELECT order_id, line_number, COUNT(*) AS copies
FROM joined_sales
GROUP BY order_id, line_number
HAVING COUNT(*) > 1;
~~~

If the business needs one successful payment, select it deterministically using the actual success and ordering rules. If it needs total payments, aggregate attempts to order grain before combining them with order totals. Adding `DISTINCT` to the final report can remove legitimate identical line values while leaving the modelling error unresolved.

## Worked example: a Type 2 join creates two facts

Validate the number of dimension matches per source fact:

~~~sql
SELECT f.sale_id, COUNT(d.customer_key) AS version_matches
FROM sales AS f
LEFT JOIN dim_customer AS d
  ON d.customer_id = f.customer_id
 AND d.valid_from <= f.sale_ts
 AND (f.sale_ts < d.valid_to OR d.valid_to IS NULL)
GROUP BY f.sale_id
HAVING COUNT(d.customer_key) <> 1;
~~~

Zero matches can mean a missing member, a coverage gap or invalid timestamps. Two matches indicate overlapping eligible versions or duplicate identity mapping. Repair the affected history and re-evaluate impacted facts; a current-row filter can hide the error by changing historical semantics.

## Worked example: lag without a slow transform

Suppose arrival is 100,000 events/second and sink commits fall to 70,000/second. Backlog grows by 30,000/second even if each worker's transformation takes the same time as before. Inspect quota errors, database connections, commit conflicts and downstream latency.

If the source itself publishes events late, adding processing capacity cannot recover time before the system receives them. Track event time, source publication, durable arrival, transform completion and consumer availability separately.

A “last modified” timestamp can advance because one fresh record arrived while an older partition remains missing. Measure coverage and age for relevant cohorts, not only a dataset-wide maximum timestamp.

## Validate the repair

Reconcile keys, counts and business totals over the affected range. Compare with the prior release and an independent source where possible. Check late events, deletes, exact time boundaries and a rerun of the same input. Then confirm downstream freshness and cache invalidation.

Monitor both correctness and operating cost after publication. A faster query that drops unmatched records is a regression even if its runtime improves.

[Metadata and lineage]({{ '/data-engineering/reliability/metadata-lineage-tools/' | relative_url }}) preserves the evidence. [Recovery and backfills]({{ '/data-engineering/reliability/recovery-replay-backfills/' | relative_url }}) controls the repair.
