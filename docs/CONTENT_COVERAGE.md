# Content coverage

This is a scope map, not a claim of exhaustive SQL coverage. Each chapter has a decision reference, a reading route, and focused lesson pages.

## Foundations

- [Data types & casting](../app/subjects/collections/_sql/foundations/data-types.md)
- [Think in rows and grain](../app/subjects/collections/_sql/foundations/grain.md)
- [Query structure & execution order](../app/subjects/collections/_sql/foundations/query-order.md)
- [PostgreSQL and BigQuery: rows, columns, and workload](../app/subjects/collections/_sql/foundations/oltp-olap-storage.md)
- [Relational databases & SQL commands](../app/subjects/collections/_sql/foundations/relational-basics.md)
- [Practice dataset & example conventions](../app/subjects/collections/_sql/foundations/sample-data.md)

## Filtering & expressions

- [NULL, CASE & conditional expressions](../app/subjects/collections/_sql/filtering/null-case.md)
- [BETWEEN, IN & pattern matching](../app/subjects/collections/_sql/filtering/predicates.md)

## Functions & dates

- [Dates, intervals & timezones](../app/subjects/collections/_sql/functions/date-time.md)
- [Numeric functions & safe arithmetic](../app/subjects/collections/_sql/functions/numeric-functions.md)
- [String functions & regular expressions](../app/subjects/collections/_sql/functions/strings.md)

## Aggregation

- [Counts, totals & conditional aggregation](../app/subjects/collections/_sql/aggregation/aggregate-functions.md)
- [GROUPING SETS, ROLLUP & CUBE](../app/subjects/collections/_sql/aggregation/grouping-sets.md)
- [Percentiles, WITHIN GROUP, and thresholds](../app/subjects/collections/_sql/aggregation/percentiles.md)

## Joins & sets

- [Joins & row multiplication](../app/subjects/collections/_sql/joins/join-types.md)
- [Set operations & all-item matches](../app/subjects/collections/_sql/joins/set-operations.md)

## Subqueries & CTEs

- [Subqueries & CTEs](../app/subjects/collections/_sql/subqueries/cte-basics.md)
- [EXISTS, IN, ANY & ALL](../app/subjects/collections/_sql/subqueries/exists-in-all.md)
- [LATERAL and per-row subqueries](../app/subjects/collections/_sql/subqueries/lateral.md)
- [Recursive CTEs & hierarchies](../app/subjects/collections/_sql/subqueries/recursive-cte.md)

## Window functions

- [NTILE, PERCENT_RANK & CUME_DIST](../app/subjects/collections/_sql/windows/distribution.md)
- [FIRST_VALUE & LAST_VALUE](../app/subjects/collections/_sql/windows/first-last.md)
- [Window frames](../app/subjects/collections/_sql/windows/frames.md)
- [The OVER clause](../app/subjects/collections/_sql/windows/introduction.md)
- [LAG, LEAD & period comparisons](../app/subjects/collections/_sql/windows/lag-lead.md)
- [ROW_NUMBER, RANK & DENSE_RANK](../app/subjects/collections/_sql/windows/ranking.md)
- [ROWS, RANGE & GROUPS](../app/subjects/collections/_sql/windows/rows-range-groups.md)
- [Running totals & moving averages](../app/subjects/collections/_sql/windows/running-calculations.md)

## Interview patterns

- [Duplicates & latest records](../app/subjects/collections/_sql/patterns/deduplication.md)
- [Ordered funnels](../app/subjects/collections/_sql/patterns/funnels.md)
- [Gaps & Islands: consecutive days & streaks](../app/subjects/collections/_sql/patterns/gaps-islands.md)
- [Conditional aggregation & pivots](../app/subjects/collections/_sql/patterns/pivoting.md)
- [Interval overlaps](../app/subjects/collections/_sql/patterns/interval-overlaps.md)
- [Period changes and missing months](../app/subjects/collections/_sql/patterns/period-changes.md)
- [Rates, populations, and weighted averages](../app/subjects/collections/_sql/patterns/rates-and-populations.md)
- [Retention & missing dates](../app/subjects/collections/_sql/patterns/retention-calendar.md)
- [Sessions & changes in state](../app/subjects/collections/_sql/patterns/sessions.md)

## Database design

- [Fact tables, dimensions & slowly changing history](../app/subjects/collections/_sql/design/dimensional-modeling.md)
- [Normalization & functional dependencies](../app/subjects/collections/_sql/design/normalization.md)

## Schema & data changes

- [Keys, constraints & defaults](../app/subjects/collections/_sql/schema/constraints.md)
- [CREATE, ALTER, DROP & TRUNCATE](../app/subjects/collections/_sql/schema/ddl.md)
- [INSERT, UPDATE & DELETE](../app/subjects/collections/_sql/schema/dml.md)
- [Upserts & MERGE](../app/subjects/collections/_sql/schema/upsert-merge.md)

## Transactions

- [ACID, commits & savepoints](../app/subjects/collections/_sql/transactions/acid.md)
- [Isolation levels & read anomalies](../app/subjects/collections/_sql/transactions/isolation.md)
- [Locks, deadlocks & lost updates](../app/subjects/collections/_sql/transactions/locks.md)

## Performance

- [Correctness & optimization traps](../app/subjects/collections/_sql/performance/common-mistakes.md)
- [Reading EXPLAIN plans](../app/subjects/collections/_sql/performance/explain.md)
- [Lab: investigate an order lookup](../app/subjects/collections/_sql/performance/index-lab.md)
- [Indexes and access paths](../app/subjects/collections/_sql/performance/indexes.md)
- [Joins, sorting, and memory](../app/subjects/collections/_sql/performance/joins-sorts.md)
- [Pagination: OFFSET and keysets](../app/subjects/collections/_sql/performance/pagination.md)
- [Lab: prove partition pruning](../app/subjects/collections/_sql/performance/partition-lab.md)
- [Partitioning & pruning](../app/subjects/collections/_sql/performance/partitioning.md)
- [Predicates and query rewrites](../app/subjects/collections/_sql/performance/sargability.md)
- [SQL Server performance investigation](../app/subjects/collections/_sql/performance/sql-server.md)
- [Statistics, cardinality, and skew](../app/subjects/collections/_sql/performance/statistics.md)
- [Warehouse performance: BigQuery, Redshift, Athena](../app/subjects/collections/_sql/performance/warehouses.md)
- [When and where to optimize](../app/subjects/collections/_sql/performance/workflow.md)

## Storage & scaling

- [Clustering means different things](../app/subjects/collections/_sql/scaling/clustering.md)
- [Choose the right storage or scaling change](../app/subjects/collections/_sql/scaling/decisions.md)
- [Replicas, freshness, and failover](../app/subjects/collections/_sql/scaling/replicas.md)
- [Sharding and distribution keys](../app/subjects/collections/_sql/scaling/sharding.md)

## PostgreSQL toolkit

- [Arrays & UNNEST](../app/subjects/collections/_sql/postgres/arrays.md)
- [JSONB extraction & expansion](../app/subjects/collections/_sql/postgres/jsonb.md)
- [DISTINCT ON & string types](../app/subjects/collections/_sql/postgres/postgres-shortcuts.md)
- [Functions, procedures & triggers](../app/subjects/collections/_sql/postgres/routines-triggers.md)
- [Privileges & parameterized queries](../app/subjects/collections/_sql/postgres/security.md)
- [Views & materialized views](../app/subjects/collections/_sql/postgres/views.md)

## Practice & revision

- [Find your next SQL problem](../app/subjects/collections/_sql/practice/platform-problems.md)

- [Apple Product Counts](../app/subjects/collections/_sql/practice/apple-users.md)
- [Later purchases of new products](../app/subjects/collections/_sql/practice/campaign-purchases.md)
- [Practice: diagnose before optimizing](../app/subjects/collections/_sql/practice/diagnosis-drills.md)
- [SQL dialect differences](../app/subjects/collections/_sql/practice/dialects.md)
- [Largest Olympics](../app/subjects/collections/_sql/practice/largest-olympics.md)
- [Mixed SQL practice with progressive hints](../app/subjects/collections/_sql/practice/mixed-drills.md)
- [Choose the right technique](../app/subjects/collections/_sql/practice/pattern-map.md)
- [Practice problem index](../app/subjects/collections/_sql/practice/problem-index.md)
- [Country rank changes](../app/subjects/collections/_sql/practice/rank-changes.md)
- [Sources, scope & coverage](../app/subjects/collections/_sql/practice/references.md)
- [Retention and the denominator](../app/subjects/collections/_sql/practice/retention-joins.md)
- [Revision drills](../app/subjects/collections/_sql/practice/revision-drills.md)
- [Spam Posts](../app/subjects/collections/_sql/practice/spam-posts.md)
- [Database interview questions](../app/subjects/collections/_sql/practice/theory-questions.md)
- [Top 5%: thresholds & quotas](../app/subjects/collections/_sql/practice/top-percent.md)

- [Payments and merchants: SQL interview exercises](../app/subjects/collections/_sql/practice/payment-merchant-queries.md)
- [BigQuery slowdown and cost](../app/subjects/collections/_sql/performance/bigquery-workload-investigation.md)

## Data Engineering: BigQuery internals

- [BigQuery slots, shuffle, and concurrency](../app/subjects/collections/_de/gcp/slots-shuffle-concurrency.md)

- [CTEs, materialization, and optimizer trade-offs](../app/subjects/collections/_sql/performance/cte-planner-tradeoffs.md)
- [Partition pruning, clustering order, and layout costs](../app/subjects/collections/_sql/performance/pruning-layout-tradeoffs.md)
- [MERGE, late updates, and replay correctness](../app/subjects/collections/_sql/schema/replay-merge-versions.md)

## Validation boundaries

PostgreSQL query results are checked with deterministic fixtures. Native PostgreSQL CI checks the index and pruning labs. SQL Server and cloud warehouse guidance is source-backed but requires those platforms for execution. Multi-session replication, failover, and sharding behavior is explained through scenarios rather than simulated by single-session tests.

## Planned subjects

- Data Engineering
- Machine Learning
- AI Engineering
- System Design
- DSA
