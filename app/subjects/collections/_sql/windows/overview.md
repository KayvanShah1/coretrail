---
title: "Window functions"
nav_title: "Overview"
description: "Compare ordered rows without losing detail."
keywords:
  - OVER
  - PARTITION BY
  - window frames
  - LAG
  - LEAD
aliases:
  - analytic functions
interview_queries:
  - when should I use window functions
chapter: "windows"
order: 0
sequence: 600
level: "Chapter overview"
---

## Partition, order, and frame are different decisions

A window calculation adds information while retaining its input rows. The partition chooses companions, the ordering establishes sequence, and the frame selects participating rows for frame-sensitive functions. Those are three separate decisions.


## Quick reference

| Need | First function / syntax |
|---|---|
| Unique row position | `ROW_NUMBER()` |
| Competition rank with gaps | `RANK()` |
| Rank distinct values without gaps | `DENSE_RANK()` |
| Previous row/value | `LAG()` |
| Next row/value | `LEAD()` |
| First value in a window | `FIRST_VALUE()` |
| Last value in a frame | `LAST_VALUE()` |
| Nth value in a frame | `NTH_VALUE()` |
| Running total | `SUM(...) OVER (...)` |
| Moving average | `AVG(...) OVER (...)` |
| Partition count without collapsing rows | `COUNT(...) OVER (...)` |
| Equal-row buckets | `NTILE(n)` |
| Relative rank from 0 to 1 | `PERCENT_RANK()` |
| Fraction of rows at or below current row | `CUME_DIST()` |

## Window anatomy

```sql
SUM(amount) OVER (
    PARTITION BY customer_id
    ORDER BY order_ts
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
)
```

| Part | Meaning |
|---|---|
| `PARTITION BY` | Restart the calculation for each group |
| `ORDER BY` | Define sequence and peers |
| frame | Choose which rows around the current row participate |

A window function keeps the input row grain. `GROUP BY` normally collapses rows.

## Frame vocabulary

| Boundary | Meaning with a ROWS frame |
|---|---|
| `UNBOUNDED PRECEDING` | Start of partition |
| `3 PRECEDING` | Three row positions before current row |
| `1 PRECEDING` | One row position before current row |
| `CURRENT ROW` | Current row |
| `1 FOLLOWING` | One row position after current row |
| `3 FOLLOWING` | Three row positions after current row |
| `UNBOUNDED FOLLOWING` | End of partition |

`BETWEEN ... AND ...` includes both frame boundaries.

## Frame recipes

| Frame | Typical use |
|---|---|
| `ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` | Running total |
| `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` | Current + previous 2 observations |
| `ROWS BETWEEN 3 PRECEDING AND 1 PRECEDING` | Previous 3, excluding current |
| `ROWS BETWEEN CURRENT ROW AND 2 FOLLOWING` | Current + next 2 |
| `ROWS BETWEEN 1 FOLLOWING AND 3 FOLLOWING` | Next 3, excluding current |
| `ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING` | Centered 3-row calculation |
| `ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING` | Remaining total |
| `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING` | Entire partition |

## ROWS vs RANGE vs GROUPS

| Frame type | Think in terms of |
|---|---|
| `ROWS` | Physical row positions |
| `RANGE` | Values / distance relative to the ordering value |
| `GROUPS` | Peer groups sharing the same ordering values |

If the problem says “last three observations”, think `ROWS`. If it says “last seven calendar days”, you may need a value-based time `RANGE` or a complete calendar followed by `ROWS`.

**PRECEDING follows the window ordering.** With `ORDER BY date DESC`, preceding rows can have later dates.

## High-value combinations

**Latest row / deduplication**

```sql
ROW_NUMBER() OVER (
    PARTITION BY customer_id
    ORDER BY order_ts DESC, order_id DESC
)
```

Then filter `rn = 1`.

**Top N distinct values**

```sql
DENSE_RANK() OVER (
    PARTITION BY department_id
    ORDER BY salary DESC
)
```

Use `ROW_NUMBER` for exactly N rows; use `DENSE_RANK` for N distinct value levels.

**Period-over-period**

Aggregate to one row per period, use `LAG(period_value)` to retrieve the previous value, then calculate the absolute or percentage change.

**Sessions / state runs**

Use `LAG` to compare adjacent records, mark each new session with `CASE`, then cumulatively sum the flags to produce a session ID.

**Percentage of total**

```sql
value / NULLIF(SUM(value) OVER (), 0)
```

## Distribution functions

| Function | What it tells you | Typical use |
|---|---|---|
| `NTILE(n)` | Which of `n` roughly equal row buckets this row belongs to | quartiles, deciles, segmentation |
| `PERCENT_RANK()` | Relative rank from 0 to 1 | relative position within the ordered partition |
| `CUME_DIST()` | Fraction of rows at or below the current value | cumulative distribution / percentile-style thresholds |

```sql
NTILE(4) OVER (ORDER BY score DESC)
```

With 10 rows, the four buckets contain `3, 3, 2, 2` rows. Equal values are not guaranteed to stay in the same `NTILE` bucket because `NTILE` balances row counts rather than value groups.

For the exact formulas, tie behavior, and worked examples, see [NTILE, PERCENT_RANK & CUME_DIST]({{ '/sql/windows/distribution/' | relative_url }}).

## Default-frame and LAST_VALUE traps

With an `ORDER BY`, do not assume the default frame behaves like an explicit row-by-row `ROWS` frame. Peer rows with equal ordering values can matter.

For the last value of the **whole partition**, make the frame explicit:

```sql
LAST_VALUE(amount) OVER (
    PARTITION BY customer_id
    ORDER BY order_ts
    ROWS BETWEEN UNBOUNDED PRECEDING
             AND UNBOUNDED FOLLOWING
)
```

## WITHIN GROUP is different from OVER

```sql
PERCENTILE_CONT(0.95)
WITHIN GROUP (ORDER BY latency_ms)
```

`WITHIN GROUP` orders values inside an ordered-set aggregate. `OVER (...)` defines a row window. Percentile aggregates belong primarily to aggregation; `PERCENT_RANK` and `CUME_DIST` are window functions.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/windows/introduction/' | relative_url }}">The OVER clause</a><span>Keep row detail while computing group-level values.</span></li>
<li><a href="{{ '/sql/windows/ranking/' | relative_url }}">ROW_NUMBER, RANK & DENSE_RANK</a><span>Control ties and select the top rows or distinct values.</span></li>
<li><a href="{{ '/sql/windows/frames/' | relative_url }}">Window frames</a><span>Choose exactly which rows participate in a calculation.</span></li>
<li><a href="{{ '/sql/windows/rows-range-groups/' | relative_url }}">ROWS, RANGE & GROUPS</a><span>Separate row positions, value distances, and peer groups.</span></li>
<li><a href="{{ '/sql/windows/lag-lead/' | relative_url }}">LAG, LEAD & period comparisons</a><span>Compare values in sequence without assuming dates are complete.</span></li>
<li><a href="{{ '/sql/windows/first-last/' | relative_url }}">FIRST_VALUE & LAST_VALUE</a><span>Understand why the frame changes what last means.</span></li>
<li><a href="{{ '/sql/windows/running-calculations/' | relative_url }}">Running totals & moving averages</a><span>Build cumulative metrics, trailing calculations, and shares.</span></li>
<li><a href="{{ '/sql/windows/distribution/' | relative_url }}">NTILE, PERCENT_RANK & CUME_DIST</a><span>Distinguish equal-row buckets from relative rank and cumulative distribution.</span></li>
</ul>

## Before you move on

Given a ranking or moving-window question, decide the partition, order, tie policy, and frame before writing syntax. If the prompt talks about calendar time, verify that “previous row” really means “previous period.”
