---
title: "PostgreSQL toolkit"
nav_title: "Overview"
description: "Work with arrays, JSON, views, and database routines."
keywords:
  - JSONB
  - arrays
  - DISTINCT ON
  - materialized views
  - stored procedures
aliases:
  - Postgres toolkit
tools:
  - PostgreSQL
chapter: "postgres"
order: 0
sequence: 1300
dialect: "PostgreSQL"
level: "Chapter overview"
---

## Use the shortcut without losing the grain

Arrays, JSONB, lateral expansion, and DISTINCT ON are useful extensions of ordinary relational patterns. Expansion can multiply rows; aggregation can collect them again. Keep track of those transitions.


## Quick reference

| PostgreSQL syntax | Use when | Common combination |
|---|---|---|
| `FILTER (WHERE ...)` | Conditional aggregate | `COUNT`, `SUM`, `AVG` |
| `DISTINCT ON (...)` | Pick first row per key | ordered latest/earliest row |
| `GENERATE_SERIES` | Generate rows | calendar spines |
| `STRING_AGG` | Ordered grouped string | `DISTINCT`, `ORDER BY` |
| `ARRAY_AGG` | Collect group values | `DISTINCT`, `ORDER BY` |
| `UNNEST` | Expand arrays to rows | `LATERAL` |
| `WITH ORDINALITY` | Keep array/function element position | `UNNEST` |
| `LATERAL` | Right-side expression depends on left row | per-row top N, expansion |
| `ANY(array)` | Test array membership/comparison | `= ANY(array)` |
| `jsonb -> / ->>` | Extract JSON value | nested fields |
| `jsonb_array_elements` | Expand JSON arrays | `LATERAL` |
| `ON CONFLICT` | PostgreSQL upsert | unique constraints |
| `RETURNING` | Return changed rows | `INSERT/UPDATE/DELETE` |
| `::type` | PostgreSQL cast shorthand | dates / numeric conversion |
| `ILIKE` | Case-insensitive LIKE | text search |
| materialized view | Persist query result | expensive reusable reads |

## DISTINCT ON

Latest row per customer:

```sql
SELECT DISTINCT ON (customer_id)
       customer_id, order_id, order_ts
FROM orders
ORDER BY customer_id, order_ts DESC, order_id DESC;
```

The `ORDER BY` chooses which row survives. For portable SQL, use `ROW_NUMBER()`.

## Arrays: expand and preserve position

```sql
SELECT u.user_id, x.skill, x.position
FROM user_skills u
CROSS JOIN LATERAL
     UNNEST(u.skills) WITH ORDINALITY AS x(skill, position);
```

Use `LEFT JOIN LATERAL ... ON TRUE` when users with null/empty expansions must remain.

Membership without expansion:

```sql
WHERE 'SQL' = ANY(skills)
```

## JSONB: extract vs expand

```sql
payload -> 'user'         -- JSON/JSONB value
payload ->> 'user_id'     -- text value
```

Use expansion functions when one JSON array element should become one SQL row. Expansion changes grain, so check row multiplication just as you would with a join.

## Upsert and changed-row output

```sql
INSERT INTO users(user_id, name)
VALUES (1, 'Kayvan')
ON CONFLICT (user_id)
DO UPDATE SET name = EXCLUDED.name
RETURNING *;
```

`ON CONFLICT` relies on an applicable unique/exclusion constraint. `RETURNING` is useful when the caller needs generated IDs or the final stored row.

## High-value PostgreSQL combinations

| Combination | Purpose |
| --- | --- |
| `GENERATE_SERIES` + `LEFT JOIN` | Complete missing-date and calendar reports |
| `UNNEST` + `WITH ORDINALITY` | Expand an array while retaining element order |
| `LEFT JOIN LATERAL` + `ORDER BY` + `LIMIT` | Retrieve related top-N rows while preserving parents |
| `FILTER` + aggregate | Calculate conditional metrics |
| `DISTINCT ON` + `ORDER BY` | Select the PostgreSQL-specific first row per group |
| JSONB expansion + `LATERAL` | Turn repeated nested values into related rows |

## Common traps

- Two independent `UNNEST`/expansion operations can multiply row counts.
- `DISTINCT ON` without deterministic `ORDER BY` can choose an unintended survivor.
- `->` returns JSON; `->>` returns text.
- `ON CONFLICT` is not a substitute for deciding the correct uniqueness key.
- PostgreSQL-specific shortcuts are useful in interviews only when the dialect permits them.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/postgres/arrays/' | relative_url }}">Arrays & UNNEST</a><span>Expand arrays, preserve empty rows, and avoid accidental products.</span></li>
<li><a href="{{ '/sql/postgres/postgres-shortcuts/' | relative_url }}">DISTINCT ON & string types</a><span>Recognize useful PostgreSQL-specific choices.</span></li>
<li><a href="{{ '/sql/postgres/jsonb/' | relative_url }}">JSONB extraction & expansion</a><span>Query nested data while keeping types, missing keys, and row counts explicit.</span></li>
<li><a href="{{ '/sql/postgres/views/' | relative_url }}">Views & materialized views</a><span>Separate reusable query definitions from stored query results.</span></li>
<li><a href="{{ '/sql/postgres/routines-triggers/' | relative_url }}">Functions, procedures & triggers</a><span>Recognize when logic belongs in a database routine and when hidden behavior adds risk.</span></li>
<li><a href="{{ '/sql/postgres/security/' | relative_url }}">Privileges & parameterized queries</a><span>Separate SQL values from SQL code and give database roles only the access they need.</span></li>
</ul>

## Keep the portable version in mind

Use the shortcut when PostgreSQL makes the intent clearer, but know the standard alternative. Also track whether an expansion such as `UNNEST` or JSON traversal changes row grain.
