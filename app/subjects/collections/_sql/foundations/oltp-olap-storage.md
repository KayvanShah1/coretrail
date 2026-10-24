---
title: "PostgreSQL and BigQuery: rows, columns, and workload"
description: "Follow a point lookup and a billion-row aggregation through storage, indexing, concurrency, and compute."
chapter: "foundations"
order: 7
sequence: 7
level: "Intermediate"
keywords:
  - "OLTP"
  - "OLAP"
  - "row-oriented storage"
  - "column-oriented storage"
  - "PostgreSQL heap"
  - "BigQuery columnar storage"
  - "MVCC"
  - "point lookup"
aliases:
  - "PostgreSQL vs BigQuery"
  - "row store vs column store"
  - "transactional database vs analytical warehouse"
interview_queries:
  - "why is PostgreSQL better for row updates and lookups than BigQuery"
  - "how does columnar storage make analytical queries efficient"
references:
  - title: "PostgreSQL physical storage"
    url: https://www.postgresql.org/docs/current/storage.html
  - title: "PostgreSQL MVCC"
    url: https://www.postgresql.org/docs/current/mvcc-intro.html
  - title: "BigQuery storage overview"
    url: https://cloud.google.com/bigquery/docs/storage_overview
  - title: "BigQuery query plan and timeline"
    url: https://cloud.google.com/bigquery/docs/query-plan-explanation
---

Imagine an application retrieving the current balance of account 4187, then an analyst calculating monthly balances across two billion transactions. Both requests can be expressed in SQL. Their storage access and concurrency needs are far apart.

## The point lookup

A typical PostgreSQL table stores rows in heap pages. A B-tree index on account_id provides a path to row locations for selective lookups. The engine traverses the index and then visits the heap when needed to check row visibility or retrieve columns absent from the index.

~~~sql
-- PostgreSQL: account_id is indexed.
SELECT balance, updated_at
FROM accounts
WHERE account_id = 4187;
~~~

For a selective request, PostgreSQL can read a small number of pages. The application may immediately issue an update in a short transaction. PostgreSQL maintains multiple row versions under multiversion concurrency control (MVCC), so readers and writers can access compatible snapshots without treating every update as a full-table rewrite.

MVCC has costs: old row versions need cleanup, indexes consume space, and updates generate write-ahead log (WAL) activity. An index may be bypassed for a query that returns most of a table because sequential access could be cheaper.

An index-only scan is possible when the index supplies the needed columns and visibility information permits avoiding heap visits. Merely selecting indexed columns does not guarantee that plan.

## The two-billion-row report

The analyst wants month, region and the sum of amounts. A row-oriented heap tends to fetch complete or near-complete row storage units while extracting a few required columns. A columnar warehouse organizes column values for compressed analytical reads, so a query selecting region, timestamp and amount can avoid reading unrelated description, address and metadata fields.

~~~sql
-- BigQuery Standard SQL: illustrative fact table.
SELECT DATE_TRUNC(DATE(transaction_ts), MONTH) AS month,
       region, SUM(amount) AS total_amount
FROM analytics.transactions
WHERE transaction_ts >= TIMESTAMP('2026-01-01')
  AND transaction_ts < TIMESTAMP('2026-10-01')
GROUP BY month, region;
~~~

BigQuery can scan relevant column data in parallel across workers, aggregate partial results, exchange intermediate groups between stages and produce final totals. Date partitioning and clustering can reduce the input even before aggregation. These physical features and distributed query capacity suit broad scans over large historical datasets.

For a single indexed row lookup, starting a distributed warehouse query often has avoidable orchestration overhead. For a very large aggregate, one PostgreSQL server can become constrained by its CPU, input/output bandwidth, memory and the execution plan even when its SQL is correct.

## What about writes and transactions?

Online transaction processing (OLTP) workloads tend to make many small, concurrent reads and writes. They need consistent account state, uniqueness constraints, short transactions and predictable update behavior. PostgreSQL is built for this pattern.

Online analytical processing (OLAP) typically summarizes many rows, accepts bulk or incremental ingestion and favors parallel read throughput. BigQuery supports transactional data manipulation, including multi-statement transactions within its documented limits. Its concurrency, mutation quotas and storage model still make it a different choice from a row-store serving thousands of individual operational updates.

A reporting system may therefore keep current balances in PostgreSQL and move transaction events into BigQuery for analytics. The pipeline connecting them needs a freshness and replay contract. A dashboard being one minute behind the operational database could be acceptable; a payment confirmation returning stale balance data may not be.

## What changes when the query changes?

| Workload | Dominant work | Common direction |
|---|---|---|
| One account by indexed ID | Find a few rows, validate visibility | PostgreSQL index path |
| Update one account and audit log | Transactional changes with consistency | PostgreSQL transaction |
| Summarize a year across all customers | Read selected columns, parallel aggregate | BigQuery analytical scan |
| Latest 100 events for one customer | Selective filter plus order | PostgreSQL index or a deliberately designed analytical table |
| Join billions of events to a dimension | Parallel scan, join distribution, partial aggregates | BigQuery or another distributed engine |

The table describes workload tendencies, not hard limitations. A column store can answer point queries and a row store can run analytics. Compare access patterns, latency requirements, data size, update frequency, consistency guarantees and operational cost before choosing the system.

## Follow the next explanation

[How a query actually runs]({{ '/sql/foundations/query-execution/' | relative_url }}) covers parsing and physical plans. [Indexes and access paths]({{ '/sql/performance/indexes/' | relative_url }}) explains selective lookups. For distributed slot execution and shuffle, use [BigQuery slots, shuffle, and concurrency]({{ '/data-engineering/gcp/slots-shuffle-concurrency/' | relative_url }}).
