---
title: "Functions & dates"
nav_title: "Overview"
description: "Transform strings, numbers, dates, and timestamps."
keywords:
  - CAST
  - date arithmetic
  - string functions
  - timestamps
aliases:
  - SQL functions
chapter: "functions"
order: 0
sequence: 200
level: "Chapter overview"
---

## Transform values without changing their meaning

Functions can normalize text, calculate measures, or align timestamps to a reporting period. The difficult part is preserving units, precision, and calendar semantics while composing those operations.


## Quick reference

| Syntax | Use when | Common combination |
|---|---|---|
| `LOWER / UPPER / TRIM` | Normalize text | comparisons, grouping |
| `LENGTH` | Count characters | validation |
| `SPLIT_PART` | Extract a delimited component | email/domain parsing |
| `REPLACE` | Literal replacement | cleanup |
| `REGEXP_REPLACE` | Pattern-based cleanup | text normalization |
| `LIKE / ILIKE` | Simple wildcard matching | `WHERE` |
| regex `~ / ~*` | Structural text matching | validation/extraction |
| `CONCAT / CONCAT_WS` | Build strings | presentation output |
| `ROUND` | Control numeric precision | rates / averages |
| `ABS` | Magnitude | differences |
| `CEIL / FLOOR` | Boundary rounding | buckets / quotas |
| `NULLIF` | Turn a sentinel/zero into null | safe division |
| `COALESCE` | Supply fallback for null | display / zero-fill |
| `DATE_TRUNC` | Convert timestamp to period grain | month/week/day aggregation |
| `EXTRACT` | Pull calendar component | year/month/hour analysis |
| `INTERVAL` | Date/time arithmetic | gaps, sessions, lookbacks |
| `AT TIME ZONE` | Convert timestamp interpretation | business-date grouping |
| `GENERATE_SERIES` | Generate dates/numbers | calendar spine, missing periods |

## Date and time combinations

**Aggregate by month**

```sql
SELECT DATE_TRUNC('month', order_ts) AS month,
       SUM(amount) AS revenue
FROM orders
GROUP BY 1;
```

**Month-over-month / week-over-week / year-over-year**

Use `DATE_TRUNC` to establish the reporting grain, aggregate each period, then apply `LAG(metric) OVER (ORDER BY period)` before calculating the change.

For YoY monthly comparisons, a 12-row `LAG` is only correct when every month exists exactly once. Otherwise join periods by the actual previous-year date/month key.

**Missing periods**

Build a calendar spine with `GENERATE_SERIES`, left join the observed aggregates, and use `COALESCE` only when an absent observation means zero.

**Half-open timestamp range**

```sql
WHERE order_ts >= TIMESTAMP '2026-01-01'
  AND order_ts <  TIMESTAMP '2026-02-01'
```

Prefer half-open periods over manually constructing “end of day” timestamps.

## String combinations

**Normalize before grouping/comparing, when business rules allow**

```sql
LOWER(TRIM(email))
```

**Ordered grouped text**

```sql
STRING_AGG(DISTINCT skill, ', ' ORDER BY skill)
```

**Regex validation**

```sql
code ~ '^[A-Z]{2}[0-9]{3}$'
```

## Safe arithmetic

```sql
100.0 * numerator / NULLIF(denominator, 0)
```

Do not silently use `COALESCE(denominator, 0)` in division. Decide what a missing or zero denominator means.

## Common traps

- `EXTRACT(MONTH FROM ts)` alone combines the same month across years.
- `LAG(date)` means previous observed row, not necessarily previous calendar day.
- Taking `::date` before applying the business timezone can assign an event to the wrong local date.
- `COALESCE(missing_metric, 0)` is valid only when missing truly means zero rather than absent/late data.
- String normalization can change meaning for case-sensitive identifiers or codes.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/functions/strings/' | relative_url }}">String functions & regular expressions</a><span>Clean text, extract pieces, and distinguish literal patterns from regex.</span></li>
<li><a href="{{ '/sql/functions/numeric-functions/' | relative_url }}">Numeric functions & safe arithmetic</a><span>Handle rounding, buckets, ratios, and zero denominators deliberately.</span></li>
<li><a href="{{ '/sql/functions/date-time/' | relative_url }}">Dates, intervals & timezones</a><span>Define calendar periods correctly and avoid timestamp boundary errors.</span></li>
</ul>

## Use this page for recall

Start with the command table. Open the deeper lesson when the question involves time zones, missing dates, precision, or null-to-zero behavior; those are where a one-line function choice can change the result.
