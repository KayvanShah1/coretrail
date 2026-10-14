---
title: "Foundations"
nav_title: "Overview"
description: "Understand tables, keys, data types, and how a query is evaluated."
keywords:
  - table grain
  - primary keys
  - SQL data types
  - query execution order
aliases:
  - SQL basics
interview_queries:
  - how is a SQL query evaluated
chapter: "foundations"
order: 0
sequence: 0
level: "Chapter overview"
---

## Start with the grain

SQL becomes easier when you can name the input population and required output grain before choosing syntax. This chapter connects tables, keys, types, and logical query order so later joins and windows have a clear foundation.


## Decision reference

| Question | Construct |
|---|---|
| Which rows are eligible? | FROM, JOIN, WHERE |
| What is the reporting grain? | GROUP BY and aggregates |
| Which groups qualify? | HAVING |
| Which comparisons retain detail? | Window functions |
| Which rows are displayed first? | Final ORDER BY, LIMIT |

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/foundations/grain/' | relative_url }}">Think in rows and grain</a><span>Establish what one input and output row represents.</span></li>
<li><a href="{{ '/sql/foundations/query-order/' | relative_url }}">Query structure & execution order</a><span>Understand logical clause order and what to optimize while writing the query.</span></li>
<li><a href="{{ '/sql/foundations/oltp-olap-storage/' | relative_url }}">PostgreSQL and BigQuery: rows, columns, and workload</a><span>Connect point lookups and large aggregations to their storage and transaction behavior.</span></li>
<li><a href="{{ '/sql/foundations/query-execution/' | relative_url }}">How a query actually runs</a><span>Follow SQL through parsing, planning, execution, and returned rows.</span></li>
<li><a href="{{ '/sql/foundations/relational-basics/' | relative_url }}">Relational databases & SQL commands</a><span>Understand relations, keys, and the jobs different SQL statements perform.</span></li>
<li><a href="{{ '/sql/foundations/data-types/' | relative_url }}">Data types & casting</a><span>Choose representations that preserve precision and meaning.</span></li>
<li><a href="{{ '/sql/foundations/sample-data/' | relative_url }}">Practice dataset & example conventions</a><span>Use a small, deterministic PostgreSQL dataset to run the handbook's core queries.</span></li>
</ul>

## Quick check

Take one query and say what one row represents after `FROM`, after `GROUP BY`, and in the final result. If the grain changes and you cannot explain why, revisit that step.
