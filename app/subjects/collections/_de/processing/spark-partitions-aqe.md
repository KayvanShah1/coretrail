---
title: "Spark SQL plans, partitioning, AQE and skew"
description: "Track a distributed query from file pruning to shuffle and window operations, then diagnose physical-plan bottlenecks."
chapter: processing
order: 3
sequence: 503
level: Intermediate
mermaid: true
keywords: [Spark SQL, PySpark, Catalyst, AQE, shuffle, broadcast join, repartition, skew]
aliases: [adaptive query execution, PySpark execution plan]
interview_queries: [how to optimize group by and rank window in Spark, when Spark needs shuffle, when partition pruning works]
references:
  - title: Apache Spark SQL performance tuning
    url: https://spark.apache.org/docs/latest/sql-performance-tuning.html
---
Spark SQL and the DataFrame API share the query optimizer and physical execution engine. Writing a query in SQL does not prevent the optimizer from choosing the same plan as a corresponding chain of DataFrame operations. The main performance questions are how many bytes the scan reads, where records must move and whether some tasks become disproportionately large.

## From storage to a windowed ranking

Suppose a trading dataset contains daily prices for every stock and exchange. The job should return the most volatile stock per exchange for one day. The source is partitioned by trading date in columnar files.

{% capture diagram_code %}
flowchart TD
A["Date-filtered Parquet scan"] --> B["Partition pruning and column projection"]
B --> C["Partial aggregation by exchange + stock"]
C --> D["Shuffle to aggregate final per-key statistics"]
D --> E["Window: rank by volatility within exchange"]
E --> F["Filter rank = 1, keeping ties when required"]
G["Spark optimizer"] -. "push filters / choose exchanges" .-> B
G -. "join + partition decisions" .-> D
H["AQE: observed shuffle statistics"] -. "coalesce / skew handling" .-> D
{% endcapture %}
{% capture diagram_fallback %}
Read only the target date and necessary columns. Partial aggregation precedes a shuffle for per-stock statistics. A window orders stocks within each exchange and filters top ranks. Spark's optimizer and AQE adapt the plan where supported.
{% endcapture %}
{% include diagram.html title="A distributed aggregate followed by a ranking window" code=diagram_code fallback=diagram_fallback caption=true %}

If date partition pruning works, the scan need not read historical partitions for other dates. Examine \`PartitionFilters\` and \`PushedFilters\` in the physical plan instead of inferring it from a SQL predicate alone. A function wrapped around the partition column can interfere with pruning, depending on expression and data source.

Grouping by exchange and stock creates a shuffled aggregate by key. The next \`ROW_NUMBER\` or \`RANK\` window may require repartitioning by exchange and sorting. Use \`RANK\` when multiple tied stocks must survive. If exactly one is required, \`ROW_NUMBER\` needs an explicit stable secondary sort to make the choice deterministic.

## AQE and skew mitigation

Adaptive Query Execution (AQE) uses runtime exchange statistics to coalesce shuffle partitions, change certain join strategies and handle some skewed joins. It cannot automatically repair every skewed aggregation. One key holding half the records may still create an expensive final aggregation task.

A broadcast join avoids shuffling a large side when the other side is sufficiently small and available. A poorly chosen broadcast can exhaust executor memory. \`repartition\` usually introduces data movement; \`coalesce\` can reduce partitions with less movement at the cost of parallelism and balance.

| Symptom | Inspect | Plausible change |
|---|---|---|
| Too much scan I/O | File layout, date filter, column projection | Prune input partitions, select fewer columns |
| Large shuffle | Aggregation keys, join strategy, partial aggregate | Reduce before exchange, avoid unnecessary joins |
| Long tail task | Task-duration spread, hot-key frequency | Key salting with correct final recombination |
| Disk spill / OOM | Executor memory, partition size, sort | Rebalance partitions, reduce state |
| Many tiny tasks | Input file sizes and partitions | Compaction, AQE coalescing, better file layout |

Storage partitioning and runtime execution partitioning are related but different. Physical files organized by date help skip input; Spark still decides task and shuffle partition counts. Hadoop Distributed File System (HDFS) merely provides file storage in many deployments and does not change the query's logical requirements.

Use \`df.explain("formatted")\` and Spark UI stage statistics to validate improvement. Measure bytes read, shuffle volume, p95 task duration and elapsed time on the same data. The [SQL window chapter]({{ '/sql/windows/overview/' | relative_url }}) owns ranking semantics; this chapter owns distributed execution.
