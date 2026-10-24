---
title: "Payments and merchants: SQL interview exercises"
description: "Rank recent successful transactions and preserve merchants with no valid events."
chapter: practice
order: 25
sequence: 1425
level: Intermediate
keywords:
  - "top two successful transactions"
  - "merchant totals"
  - "BigQuery QUALIFY"
  - "SAFE_CAST"
  - "LEFT JOIN"
interview_queries:
  - "how to find last two successful transactions per customer"
  - "how to join merchant IDs with leading zeroes and exclude invalid amounts"
references:
  - title: "BigQuery QUALIFY"
    url: https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax#qualify_clause
  - title: "Conversion functions"
    url: https://cloud.google.com/bigquery/docs/reference/standard-sql/conversion_functions
---

Two transaction problems expose different ways of accidentally changing the population of a result. In one, unsuccessful records must be removed before ranking. In the other, invalid records must be removed without dropping merchants who have no matching events. The example schemas are illustrative.

## Last two successful transactions per customer

One output row represents one successful payment. Customers with no successes should disappear; a customer with one success should contribute one row. Where successful transactions for the same customer have unique timestamps, descending time establishes their order.

~~~sql
-- BigQuery Standard SQL
SELECT customer_id, transaction_id, txn_ts, amount
FROM payments
WHERE status = 'SUCCESS'
QUALIFY ROW_NUMBER() OVER (
  PARTITION BY customer_id
  ORDER BY txn_ts DESC
) <= 2
ORDER BY customer_id, txn_ts DESC;
~~~

The WHERE condition removes failures before the window function ranks rows. If the most recent payment failed, ranking all payments first and filtering status afterward can displace a valid payment from the top two.

In PostgreSQL, use a common table expression (CTE), select the row number, then filter rn in an outer query. If production timestamps may tie, add a stable transaction ID as a secondary ordering expression. DENSE_RANK answers a different requirement: timestamps tied at the second rank could yield more than two rows.

A useful fixture contains three customers: A with three successes and one later failure, B with one success, and C with only failures. Verify that A contributes exactly two successes, B contributes one, and C contributes none.

## Merchant totals with inconsistent identifiers

Now one output row represents one merchant, including those without valid events. Suppose the merchant table stores 42 while incoming events use both 42 and 00042. The source contract defines these as the same numeric merchant ID. Event amounts may be formatted as text, including the sentinel NA.

~~~sql
-- BigQuery Standard SQL
WITH clean_events AS (
  SELECT
    event_id,
    SAFE_CAST(merchant_id AS INT64) AS merchant_key,
    SAFE_CAST(amount AS NUMERIC) AS amount_value
  FROM merchant_events
)
SELECT
  m.merchant_id,
  m.merchant_name,
  COALESCE(SUM(e.amount_value), 0) AS total_amount,
  COUNT(e.event_id) AS valid_event_count
FROM merchants AS m
LEFT JOIN clean_events AS e
  ON SAFE_CAST(m.merchant_id AS INT64) = e.merchant_key
 AND e.amount_value IS NOT NULL
GROUP BY m.merchant_id, m.merchant_name
ORDER BY m.merchant_name, m.merchant_id;
~~~

SAFE_CAST turns malformed amounts into null. The valid-amount condition is in ON, so merchants with no valid matches survive the LEFT JOIN. A corresponding WHERE condition would remove them. COUNT(e.event_id) counts matched events when event IDs are non-null; COUNT(*) would count the unmatched placeholder row.

For an example fixture, Harbor (42) has amounts 10 and 15 under IDs 42 and 00042, plus a record whose amount is NA. Market (7) has one valid amount of 8. Empty (9) has no events. Expected totals are Harbor 25 (two events), Market 8 (one), Empty 0 (zero).

This normalization is appropriate only when IDs are defined as numeric. Alphanumeric IDs must not be silently cast away. Invalid amounts and IDs should be counted and reported during ingestion so that apparently clean rollups do not hide lost data.

## The common reasoning

Before SQL, write down the allowed population, result grain, operation, and edge cases. Filter before ranking for the transaction query. Preserve the left-side population and filter matches at the join for the merchant query.

See [Joins & row multiplication]({{ '/sql/joins/join-types/' | relative_url }}), [ROW_NUMBER, RANK & DENSE_RANK]({{ '/sql/windows/ranking/' | relative_url }}), and [Duplicates & latest records]({{ '/sql/patterns/deduplication/' | relative_url }}).
