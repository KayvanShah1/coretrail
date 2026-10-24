---
title: "Choosing storage from data shape, access pattern and scale"
description: "Map transactions, telemetry, documents, analytics and search to suitable databases and physical layouts."
chapter: storage
order: 4
sequence: 304
level: Core
last_verified: "2026-10-25"
keywords: [database selection, storage selection, data volume, PostgreSQL, BigQuery, Bigtable, MongoDB, ClickHouse, Elasticsearch, time series, hot keys]
interview_queries: [which database should store telemetry and analytical data, how does data volume change storage and partitioning choices]
references:
  - title: PostgreSQL index types
    url: https://www.postgresql.org/docs/current/indexes-types.html
  - title: MongoDB data modelling
    url: https://www.mongodb.com/docs/manual/data-modeling/
  - title: Bigtable schema and row-key design
    url: https://docs.cloud.google.com/bigtable/docs/schema-design
  - title: ClickHouse MergeTree
    url: https://clickhouse.com/docs/reference/engines/table-engines/mergetree-family/mergetree
  - title: Elasticsearch indexing and mappings
    url: https://www.elastic.co/docs/solutions/search/get-started/index-basics
  - title: BigQuery clustered tables
    url: https://docs.cloud.google.com/bigquery/docs/clustered-tables
---

The nature of the data suggests a representation; the queries and consistency requirements select the storage behavior. Device telemetry can feed a keyed operational store, a columnar archive and a reporting mart at the same time. Each representation needs a defined consumer and correction path.

## State the workload in measurable terms

Record typical record size, retained volume, ingress and update rate, read/write concurrency, query predicates, selectivity, latency target, retention and recovery objectives. Selectivity is the fraction of records a predicate matches. A query returning one account and a query aggregating every account stress different access paths.

Also identify skew: which tenant, device or key dominates traffic? Average throughput can look healthy while one shard is overloaded. A shard is a subset of data assigned to a storage or serving unit; its key determines which requests must share that unit.

## Data shape and access pattern

| Data and request | Starting representation/store | Layout or index to investigate | Operating cost |
|---|---|---|---|
| Orders, balances and transactional constraints | Relational tables, for example PostgreSQL | B-tree indexes for selective keys/ranges; partition only for demonstrated lifecycle or access needs | Index writes, locking, vacuum and replicas |
| Nested entity normally read as a whole | Document model, for example MongoDB | Index the actual predicates; embed bounded data consumed together | Unbounded arrays, duplicated attributes and cross-document changes |
| High-rate per-device history with predictable key/range reads | Wide-column/key-ordered store, for example Bigtable | Device-oriented row keys with time ranges and measured distribution | Hot keys, oversized rows and less flexible access paths |
| Historical facts scanned across many rows | Warehouse or lakehouse with columnar execution | Time/retention layout, selective clustering and aggregate marts | Scans, updates, concurrency and maintenance |
| Frequent interactive aggregates over event data | Analytical serving engine, for example ClickHouse | Sorting keys aligned with filters; partition for lifecycle needs | Insert batching, part/merge backlog and mutation behavior |
| Ranked text search and filters | Search index, for example Elasticsearch | Field mappings and an inverted index, which maps terms to matching documents | Indexing lag, shard sizing and reindexing |
| Small reusable current values with tight read latency | Key-value serving store or cache | Stable lookup keys and explicit expiry/invalidation | Memory, durability choices and stale values |
| Multi-hop relationship traversal | Relational adjacency model or graph representation | Traversal patterns and indexes | Relationship fan-out and consistency across updates |

JSON arriving from an API does not by itself require a document database. It can be normalized into relations or stored as raw objects with curated analytical columns. The [model representation reference]({{ '/data-engineering/modelling/models-keys-relationships/' | relative_url }}) explains the entity and relationship choices.

Partitioning is also not an authorization mechanism. Tenant isolation requires access policies and tests even when each tenant has its own physical range.

## Telemetry needs different keys for different reads

Suppose operations asks for the last hour of one device, while finance asks for monthly totals across all devices. A device-and-time row key can localize the operational range. A global timestamp-leading key can concentrate incoming writes in a narrow range; Bigtable specifically warns against this hotspot pattern.

An analytical copy can use a coarser time layout and device or tenant clustering where supported. A monthly aggregate can serve finance without repeatedly scanning every reading. All copies must agree on source identity, event time, deduplication and correction versions.

Salting adds a distributed prefix to spread a hot logical key across physical ranges. It also makes reads query and combine several ranges. Introduce it after measuring key pressure and knowing how the reader will find every shard.

## Stored terabytes do not determine the product

| Illustrative situation | First design question | Why volume alone misleads |
|---|---|---|
| 20 GB of transactional state with thousands of concurrent writes | Can indexed transactions meet latency and contention targets? | A small hot working set can be demanding |
| 5 TB of historical files queried once monthly | Can an on-demand engine scan the relevant columns economically? | Retention can be large while active compute is small |
| 500 GB of facts behind many simultaneous reports | Are analytical concurrency, summaries and workload isolation adequate? | Query frequency can dominate data growth |
| 10 TB of telemetry with narrow device/time reads | Does the key distribution support the intended ranges and peaks? | The read and write pattern matters more than the total |
| A growing search corpus | How many indexed fields, updates and ranked queries are required? | Index size and query behavior differ from source-file bytes |

These examples identify experiments, not maximum supported sizes. Use the [capacity worksheet]({{ '/data-engineering/foundations/capacity-estimation/' | relative_url }}) to estimate logical bytes, indexed/derived copies, peak throughput and catch-up headroom.

PostgreSQL can support substantial analytical workloads; a warehouse is justified when measured scan, concurrency, integration or isolation requirements call for it. A columnar lake table can retain enormous history while still providing poor point-lookup latency. Check the selected engine and layout.

## Optimize the path that consumes the work

For transactional queries, inspect selectivity, index access and write amplification in the [SQL performance chapter]({{ '/sql/performance/overview/' | relative_url }}). For lake tables, use [partitioning, clustering and file sizing]({{ '/data-engineering/storage/partitioning-file-sizing/' | relative_url }}). For distributed transformations, inspect [query plans and runtime work]({{ '/data-engineering/processing/query-plans-pruning/' | relative_url }}).

A managed warehouse usually owns its internal data files; tune the exposed partitioning, clustering and workload controls. Object-store file-size settings belong to the jobs or table services writing those objects. Database page size, Parquet row-group size and stream micro-batch size are different controls.

Choose [transformation tools]({{ '/data-engineering/orchestration/transformation-tool-selection/' | relative_url }}) after locating the input and expensive operation. The [lake and warehouse design reference]({{ '/data-engineering/architecture/lake-warehouse-design/' | relative_url }}) explains when another serving copy earns its storage and recovery cost.
