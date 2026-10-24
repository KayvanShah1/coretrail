---
title: "Data capacity and back-of-the-envelope calculations"
description: "Estimate volume, processing headroom, state, file counts, replay time and scan cost before sizing a data platform."
chapter: "foundations"
order: 2
sequence: 102
level: "Core"
math: true
keywords: ["capacity planning","back of envelope","throughput","retention","backlog","Little law","state size","file count","scan cost","capacity limits"]
interview_queries: ["how to size a data pipeline","how long does a backlog take to recover"]
last_verified: "2026-10-25"
references: [{"title":"PostgreSQL implementation limits","url":"https://www.postgresql.org/docs/current/limits.html"},{"title":"BigQuery quotas and limits","url":"https://docs.cloud.google.com/bigquery/quotas"},{"title":"Spark SQL performance tuning","url":"https://spark.apache.org/docs/latest/sql-performance-tuning.html"},{"title":"Flink state backends","url":"https://nightlies.apache.org/flink/flink-docs-stable/docs/ops/state/state_backends/"}]
---

Begin with records per second, bytes per record, peak shape, retention, update frequency, query concurrency and freshness targets. A billion-row table serving one nightly report needs different capacity from one handling thousands of keyed updates per second.

The calculations below use illustrative assumptions; measured inputs replace them during sizing. Decimal units are used: 1 KB = 1,000 bytes, 1 GB = 10^9 bytes and 1 TB = 10^12 bytes.

## Convert event rate into stored volume

{% include math.html tex="V_{day}=r\times b\times 86400" block=true %}

At 100,000 events/second and an assumed 1 KB/event, ingress is 100 MB/second and 8.64 TB/day before compression. With measured 4:1 compression, one stored representation is about 2.16 TB/day or 64.8 TB over 30 days.

Count raw, curated, serving and historical copies separately. Include indexes, table metadata, retained versions, temporary rewrites and cross-region copies. Avoid multiplying a managed storage bill by an imagined replication factor when the service already includes its internal durability copies.

With an illustrative 256 MB target file size, 2.16 TB/day corresponds to about 8,438 files/day before partition boundaries and compaction. If writers instead produce one 1 MB file for each batch, metadata work can dominate despite modest byte volume. Benchmark the file size for the actual engine and query pattern.

## Stable throughput needs spare capacity

{% include math.html tex="u=\frac{\lambda}{\mu},\qquad T_{catchup}=\frac{B}{\mu-\lambda}\quad (\mu>\lambda)" block=true %}

Here `λ` is arrival rate, `μ` sustainable processing rate and `B` accumulated backlog. Service capacity must exceed arrivals to drain a queue while new data continues arriving.

A ten-minute outage at 100,000 events/second creates 60 million events of backlog. If workers sustain 160,000/second after recovery, the net drain is 60,000/second: catch-up takes 1,000 seconds, about 16.7 minutes. That assumes no new bottleneck from the sink, compaction or replay.

For an illustrative 60% normal utilization target, 100 MB/second ingress calls for at least about 166.7 MB/second sustainable capacity. A peak twice as large changes that requirement. Tail latency rises as utilization and burstiness approach saturation.

Little's law estimates average in-flight work in a stable system: arrival rate multiplied by average time in system. At 5,000 records/second and two seconds mean processing time, approximately 10,000 records are in flight. This average does not bound bursts or worst-case memory.

## State and key distribution

Suppose five million active keys each require 200 bytes of logical state. The payload is about 1 GB before serialization, indexes, timers, checkpointing and runtime overhead. A 24-hour event window may retain many observations per key, not one value.

More partitions help only if keys distribute. One customer generating half the traffic can saturate one keyed operator. Inspect per-partition rates and state sizes; changing partition count alone cannot split an indivisible business key.

## Estimate scans, updates and backfills

A 100 GB/day fact table retained for 30 days contains about 3 TB before other copies. One full-period scan per minute represents roughly 4.32 PB/day of logical scan volume. Projection and partition pruning can reduce actual bytes substantially. Use measured engine bytes, query plans and applicable pricing rather than charging from raw object size.

A 30-day backfill over that table reads about 3 TB. Completing in three hours requires about 278 MB/second of input scan throughput before joins, shuffle, decompression, writes and contention. Reserve capacity for the live pipeline as well.

For a wide-table update, estimate affected rows and files. A million scattered key changes can touch a large fraction of a table even if the incoming batch is small. Measure physical rewrite bytes divided by changed logical bytes.

## Hard limits, quotas and achieved performance

| Constraint | Meaning | How to use it |
|---|---|---|
| Hard implementation limit | Maximum supported object or structure | Design below it; partition or change representation when needed |
| Service quota | Allowed project/region/API allocation | Inspect the effective project limit and request increases where supported |
| Sustainable throughput | Measured rate while meeting latency/error goals | Load-test with representative records, concurrency and failures |
| Recovery capacity | Rate available while live work continues | Verify catch-up before retained history expires |

Official documentation checked on October 25, 2026 lists a PostgreSQL relation-size limit of 32 TB with the default 8 KB block size. This is not a database-wide throughput rating or a partitioned logical table limit.

The checked BigQuery quota page lists up to two concurrent mutating data manipulation language (DML) statements per table, with additional work queued under documented limits. Its Storage Write API throughput quotas vary by location and project allocation. Inspect the API and effective quota instead of interpreting storage capacity as write capacity.

## Translate capacity into a cost envelope

Use current regional prices or contract rates as variables: retained GB multiplied by storage price, scanned TB multiplied by applicable scan price, provisioned compute-hours, request charges and network transfer. Reserved-capacity pricing needs a different model from pay-per-scan pricing.

For the illustrative full-scan workload above, 4,320 TB/day multiplied by an applicable price P per scanned TB gives 4,320 × P per day before caching, pruning, free allowances or discounts. P is an input from the applicable pricing agreement. A layout change that reduces scanned bytes to 1% changes that part of the envelope by two orders of magnitude, provided the measured engine statistics confirm the reduction.

## Capacity assumptions and load testing

State the input assumptions, average and peak workload, compression evidence, required retention and recovery window. Test normal load, a hot key, a failed worker and a replay running beside production. Measure freshness, p95 latency, error rate, bytes processed and cost.

A design is ready when its publication and recovery targets hold under those tests. A promising average throughput figure alone leaves overload and reconstruction unanswered.
