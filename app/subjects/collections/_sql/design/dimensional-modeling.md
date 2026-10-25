---
title: "Resolving dimension versions in analytical SQL"
description: "Validate historical joins for one match per fact and preserve rows whose dimension version is missing."
chapter: design
order: 2
sequence: 802
level: Intermediate
keywords: [dimensional SQL, fact grain, as-of join, dimension key, Type 2 join]
interview_queries: [why does a historical dimension join multiply sales rows, how do I find missing dimension versions]
---

A fact needs the dimension version appropriate to its reporting time. The [dimensional modelling reference]({{ '/data-engineering/modelling/dimensional-facts-schemas/' | relative_url }}) explains fact patterns and schema choices; [slowly changing dimensions]({{ '/data-engineering/modelling/scd-temporal-history/' | relative_url }}) works through history and correction semantics. This page checks the SQL join.

## Resolve one historical version

Assume sales_staging has one row per order line, identified by (order_id, line_number). Dimension intervals are half-open: valid_from is included and valid_to is excluded. A null valid_to represents an open interval.

~~~sql
SELECT s.order_id, s.line_number, d.customer_key, d.city
FROM sales_staging s
LEFT JOIN dim_customer d
  ON d.customer_id = s.customer_id
 AND s.sale_ts >= d.valid_from
 AND (s.sale_ts < d.valid_to OR d.valid_to IS NULL);
~~~

LEFT JOIN preserves a sale whose dimension is missing so that it can be diagnosed. An inner join silently removes it. A record at exactly the change timestamp matches the new version.

| Customer version | Interval | Sale timestamp | Match |
|---|---|---|---|
| key 101 | June 1 through July 1, end excluded | June 30 at noon | 101 |
| key 205 | July 1 onward | July 1 at midnight | 205 |

This example assumes source timestamps and interval endpoints use the same timezone and comparable types. Business-effective time and platform load time can answer different questions.

## Count matches before publishing facts

~~~sql
SELECT s.order_id, s.line_number,
       COUNT(d.customer_key) AS dimension_matches
FROM sales_staging s
LEFT JOIN dim_customer d
  ON d.customer_id = s.customer_id
 AND s.sale_ts >= d.valid_from
 AND (s.sale_ts < d.valid_to OR d.valid_to IS NULL)
GROUP BY s.order_id, s.line_number
HAVING COUNT(d.customer_key) <> 1;
~~~

The dimension key is assumed non-null on real dimension rows. Counting that key produces zero for an unmatched outer row; COUNT(*) would count the preserved row and conceal the missing match.

A zero count calls for an explicit missing-dimension policy. A count above one indicates overlapping versions or duplicated dimension rows. DISTINCT over the final report can hide the symptom while leaving measures wrong.

Validate input fact uniqueness independently, then compare fact counts and business totals before and after version resolution. Once the correct surrogate version key is stored on a fact, ordinary star queries can join on that key without repeating the time-range resolution.
