---
title: "CTEs, materialization, and optimizer trade-offs"
description: "Understand when CTE reuse, filtering, and materialization alter physical work."
chapter: performance
order: 18
sequence: 1118
level: Intermediate
keywords:
  - "CTEs, materialization, and optimizer trade-offs"
interview_queries:
  - "explain ctes, materialization, and optimizer trade-offs"
references:
  - title: PostgreSQL CTE materialization
    url: https://www.postgresql.org/docs/current/queries-with.html#QUERIES-WITH-CTE-MATERIALIZATION
  - title: BigQuery performance guidance
    url: https://cloud.google.com/bigquery/docs/best-practices-performance-compute
---

A common table expression (CTE) names a subquery. Naming an intermediate result makes complex SQL easier to read, but does not define whether the database materializes it once, inlines it, or evaluates it more than once. That decision varies by database and query.

## PostgreSQL: the planner can inline or materialize

In current PostgreSQL, a non-recursive side-effect-free CTE referenced once can generally be folded into the parent query. This allows outer filters to participate in optimization. A CTE referenced multiple times is generally materialized by default, although the planner's documented behavior and explicit MATERIALIZED or NOT MATERIALIZED modifiers can change that decision.

~~~sql
WITH recent_orders AS NOT MATERIALIZED (
  SELECT customer_id, amount
  FROM orders
  WHERE order_ts >= TIMESTAMP '2026-01-01'
)
SELECT customer_id, SUM(amount)
FROM recent_orders
GROUP BY customer_id;
~~~

The inline form can expose predicates and enable a plan comparable to an equivalent subquery. Materialization evaluates the CTE separately and stores its result for consumers. That can avoid duplicating an expensive computation, but can prevent parent predicates from pushing into the CTE.

## What happens when the CTE is referenced twice?

Imagine a costly filtered aggregation referenced by two branches of a query. Inlining it twice might scan or calculate the aggregate twice. Materializing it may compute the shared result once, but requires memory or temporary storage and may prevent branch-specific filter pushdown.

There is no universal faster choice. Look at the physical plan, number of scans, filtered rows, materialization size and elapsed time before replacing one form with another.

## BigQuery: different implementation decisions

BigQuery non-recursive CTEs are primarily a query-structuring feature; they do not by themselves promise persistent materialization or automatic reuse. Query planning can evaluate a referenced CTE more than once. For repeated expensive work, a temporary table in a multi-statement script, a materialized view where supported, or a maintained summary can make reuse explicit.

~~~sql
CREATE TEMP TABLE recent_orders AS
SELECT customer_id, amount
FROM analytics.orders
WHERE order_date >= DATE '2026-01-01';

SELECT customer_id, SUM(amount)
FROM recent_orders
GROUP BY customer_id;
~~~

A temporary table also writes intermediate data, so its cost is justified only when the reuse or simpler plans outweigh that work. Test against a single-query solution using actual job statistics.

## Common follow-up

Why did rewriting a CTE as a subquery speed up a report? The answer may involve predicate pushdown, repeated evaluation, join order or the physical plan, and it must be confirmed on the actual engine. Avoid attributing every difference to a universal 'CTEs are slow' rule.

The canonical mechanics of logical SQL and physical plans are in [How a query actually runs]({{ '/sql/foundations/query-execution/' | relative_url }}).
