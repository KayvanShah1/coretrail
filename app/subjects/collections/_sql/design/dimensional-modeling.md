---
title: "Fact tables, dimensions & slowly changing history"
description: "Choose an analytical grain before choosing keys or columns."
chapter: "design"
order: 2
sequence: 802
level: "Intermediate"
references: [{"title":"Microsoft dimensional modeling guidance","url":"https://learn.microsoft.com/en-us/power-bi/guidance/star-schema"}]
---

## Declare the fact grain

For sales, a useful grain is **one row per order line**. Measures can include quantity and line revenue; foreign keys identify date, customer, and product dimensions.

| Table | Example columns | Grain |
|---|---|---|
| `fact_sales` | order_id, line_number, customer_key, product_key, sale_date, revenue | One sold line |
| `dim_customer` | customer_key, customer_id, city, valid_from, valid_to | One customer version |
| `dim_product` | product_key, product_id, category | One product version or current product |

Mixing daily totals and individual orders in the same fact table without a clear type can double-count revenue. A balance snapshot is also different from a transaction flow: summing balances over dates often has no useful interpretation.

## Type 1 versus Type 2

Type 1 overwrites an attribute, such as correcting a misspelled name. Type 2 adds a new dimension version to retain historical attributes, such as the customer's region at purchase time.

```sql
SELECT s.order_id, d.city
FROM sales_staging s
JOIN dim_customer d
  ON d.customer_id = s.customer_id
 AND s.sale_ts >= d.valid_from
 AND (s.sale_ts < d.valid_to OR d.valid_to IS NULL);
```

Assume version intervals are non-overlapping and half-open. Overlaps create multiple matches and inflate facts. Gaps leave facts without a version. Validate both conditions.

## Explain the trade-off

A surrogate key identifies a dimension version; the business key identifies the real-world customer. Keeping them separate lets facts refer to the version that was valid at the event time.

For a current-state report, joining only the current dimension version may be deliberate. For a historical report, it can rewrite the apparent past. Ask which meaning the stakeholder needs.

For the full reference, see [star schemas and fact patterns]({{ '/data-engineering/modelling/dimensional-facts-schemas/' | relative_url }}) and [SCD Types 0–7 with temporal corrections]({{ '/data-engineering/modelling/scd-temporal-history/' | relative_url }}).
