---
title: "BigQuery slots, shuffle, and concurrency"
description: "Explain how stages share capacity and why skew, spill, or competing queries can increase latency."
chapter: "gcp"
order: 2
sequence: 402
level: "Intermediate"
keywords:
  - "BigQuery slots"
  - "slot-ms"
  - "shuffle"
  - "join skew"
  - "reservation contention"
  - "JOBS_TIMELINE"
  - "QUERY_INFO"
  - "slot contention"
  - "shuffle quota contention"
aliases:
  - "BigQuery distributed execution"
  - "BigQuery slot allocation"
  - "BigQuery stage wait time"
interview_queries:
  - "what happens when several users run BigQuery queries at the same time"
  - "what is a BigQuery slot and how does shuffle work"
  - "why can BigQuery runtime increase when scanned bytes stay constant"
references:
  - title: "BigQuery query plan and timeline"
    url: https://cloud.google.com/bigquery/docs/query-plan-explanation
  - title: "BigQuery query performance insights"
    url: https://cloud.google.com/bigquery/docs/query-insights
  - title: "BigQuery query queues"
    url: https://cloud.google.com/bigquery/docs/query-queues
  - title: "BigQuery jobs timeline"
    url: https://cloud.google.com/bigquery/docs/information-schema-jobs-timeline
---

A date-filtered query can scan the same number of bytes on Monday and Tuesday yet take five seconds on one day and forty on the other. Scan volume is only one component of execution time. The query may be waiting for resources, producing more join output, or moving a larger intermediate result between stages.

## From SQL to work units

BigQuery plans a query as an execution graph containing stages and steps. Workers run the work units in those stages. A slot is an abstract unit of execution capacity covering processing and associated memory and input/output resources. Slots allow the service to run many units in parallel.

A stage may read columns and filter rows while another stage aggregates results from earlier work. Stages can overlap in time. When a grouping or join requires rows with matching keys to meet on the same workers, stages exchange intermediate data through distributed shuffle.

~~~text
Read orders by date       Read merchant dimension
       |                           |
   Filter rows                 Filter rows
       |                           |
       +------ JOIN / shuffle -----+
                      |
              Partial aggregation
                      |
              Shuffle by region
                      |
              Final aggregation
~~~

A join with a small dimension might use a broadcast strategy and avoid shuffling the large side. A large-to-large join often requires redistribution. Which physical strategy the planner chooses depends on estimates and the available execution mechanisms.

## Slot-ms and latency describe different things

Suppose a query uses an average of 50 slots over 20 seconds. That is approximately 1,000 slot-seconds, or 1,000,000 slot-milliseconds (slot-ms). A second execution might finish in 10 seconds with twice the average parallel capacity while consuming a similar number of slot-ms.

The same idea works in reverse: lower parallelism can increase elapsed time without doubling total computational work. This is why total_slot_ms and elapsed time should be compared together. Average slots can be approximated as total_slot_ms divided by active execution milliseconds, but a wall-clock job interval may include preparation, queueing and other work; label any approximation accordingly.

Slot consumption and query billing are different measurements. On-demand analysis pricing typically depends on billed bytes, while capacity-based pricing depends on the capacity arrangement and usage.

## Shuffle and data skew

Consider a grouped report by merchant_id. If a few merchants account for most transactions, hash-based redistribution can give one worker much more work than the others. An otherwise parallel stage becomes gated by that worker.

In the execution graph, compare mean and maximum worker compute times, input row counts, shuffle bytes, and data spilled to disk. Large output from a join can indicate a many-to-many match error; correcting the join grain may fix performance and the numbers simultaneously.

BigQuery may insert repartition stages while the query runs. Dynamic repartitioning is an optimizer response to data distribution and is not, by itself, proof of a problem.

## Concurrency and reservations

Queries sharing a reservation compete for processing capacity under BigQuery's scheduler. A project running many dashboards and an expensive backfill together may see queued work or fewer slots available to individual jobs. Reservation concurrency targets and fair scheduling affect how simultaneous jobs are admitted and allocated resources.

The execution timeline reports active, pending, and completed units of work. If pending units remain high while active work stays limited, investigate slot availability and competing queries. Compare reservation metrics and job start delays before increasing capacity.

Shuffle also consumes shared resources. Shuffle-quota contention is a distinct symptom from a broad input scan; a workload that spills or holds large intermediate results can affect neighbors in the same reservation.

## Investigate the five-to-forty-second regression

Start with a known-good job and the slower job, keeping SQL, parameters, source data intervals and cache behavior comparable. Look for the following evidence:

| Evidence | Likely direction |
|---|---|
| More bytes scanned | Changed input or ineffective partition/block pruning |
| Similar scans, more join output | Duplicated matching keys, changed cardinality |
| Similar scans, much larger shuffle | Wider intermediates, grouping or join redistribution |
| Maximum worker time far above average | Skewed keys or uneven task work |
| Many pending units, few active | Capacity contention or scheduling |
| Increased disk spill | Intermediate-state pressure and shuffle limits |
| Similar stage work, longer job before first stage | Queueing, metadata or planning investigation |

A materialized summary can reduce repeated aggregation when freshness allows it. Filtering and projecting earlier can reduce the rows carried into shuffle. An extra reservation may help when contention is proven, but it will not repair an accidental many-to-many join.

Keep the result grain and business totals fixed while testing these changes. To investigate scan and billing measurements, continue to [BigQuery slowdown and cost]({{ '/sql/performance/bigquery-workload-investigation/' | relative_url }}).
