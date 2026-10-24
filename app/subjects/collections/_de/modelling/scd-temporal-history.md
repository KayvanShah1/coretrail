---
title: "Slowly changing dimensions and temporal history"
description: "Choose SCD types by reporting semantics, implement non-overlapping versions and handle corrections and late-arriving facts."
chapter: "modelling"
order: 3
sequence: 153
level: "Core"
mermaid: true
keywords: ["SCD","type 0","type 1","type 2","type 3","type 4","type 5","type 6","type 7","bitemporal","late arriving dimensions"]
interview_queries: ["SCD type 1 vs type 2 and hybrids","how to handle late arriving dimensions"]
last_verified: "2026-10-25"
references: [{"title":"Kimball SCD Types 0, 4, 5, 6 and 7","url":"https://www.kimballgroup.com/2013/02/design-tip-152-slowly-changing-dimension-types-0-4-5-6-7/"},{"title":"Kimball Type 2 dimension changes","url":"https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-2/"},{"title":"dbt snapshot semantics","url":"https://docs.getdbt.com/docs/build/snapshots"},{"title":"Microsoft dimensional history guidance","url":"https://learn.microsoft.com/en-us/power-bi/guidance/star-schema"}]
---

A customer's region changes from West to South. A report may need the region at purchase time, today's region for every past purchase, or both. Slowly changing dimension (SCD) policies encode that reporting decision. Policies apply per attribute: a name correction and a sales-territory change can follow different rules in one dimension.

## Type numbers and their effect

| Type | Storage policy | Reporting consequence |
|---|---|---|
| 0 | Retain original value | Group by the original attribute |
| 1 | Overwrite value | Historical facts see the replacement attribute |
| 2 | Insert a dimension version with a new surrogate key | Facts can retain event-time classification |
| 3 | Add bounded alternate/previous-value columns | Compare selected old/current classifications |
| 4 | Separate changing profiles into a mini-dimension | Facts reference entity and profile keys |
| 5 | Type 4 plus a current-profile reference on the entity | Support historical and current-profile reporting |
| 6 | Type 2 history plus overwritten current-attribute columns | Historical rows expose then/current values |
| 7 | Fact references a historical surrogate and durable entity key | Separate historical and current lookup paths |

Types 4–7 above follow Kimball's published terminology. Other material sometimes calls a separate history table “Type 4.” Describe the schema and join behavior whenever terminology could be ambiguous.

Type 6 can require updating current-value columns across many versions of one entity. Type 7 shifts that responsibility to explicit joins. The right choice depends on reporting frequency, write amplification and how clearly consumers can distinguish historical from current attributes.

## A Type 2 change at an exact boundary

| customer_key | customer_id | region | valid_from | valid_to |
|---|---|---|---|---|
| 101 | C42 | West | 2026-01-01 | 2026-07-01 |
| 205 | C42 | South | 2026-07-01 | NULL |

Use half-open intervals: the first row covers `[2026-01-01, 2026-07-01)`. A sale at the exact July boundary matches the second row. Use a consistent timezone and precision.


{% capture diagram_1 %}
flowchart TD
E["Source change with business key and effective time"] --> V["Deduplicate and order source revisions"]
V --> C{"Tracked attributes changed?"}
C -- "No" --> N["Record processing progress"]
C -- "Yes" --> S["Stage closed prior interval and new version"]
S --> T{"No overlaps, valid keys and references?"}
T -- "No" --> Q["Quarantine or repair affected history"]
T -- "Yes" --> P["Commit or publish a coherent version set"]
P --> F["Resolve affected facts by event time"]
{% endcapture %}
{% capture fallback_1 %}
Deduplicate and order changes, compare tracked attributes, stage the prior interval closure and new version, validate history, then publish and resolve affected facts.
{% endcapture %}
{% include diagram.html title="Publish a customer-history change as one logical operation" code=diagram_1 fallback=fallback_1 caption=true %}


Closing the old version and inserting the new version need one database transaction or a controlled publication mechanism. Publishing only the closure creates a gap. Publishing the new version first can create two matches.

~~~sql
SELECT f.sale_id, d.customer_key, d.region
FROM sales AS f
LEFT JOIN dim_customer AS d
  ON d.customer_id = f.customer_id
 AND d.valid_from <= f.sale_ts
 AND (f.sale_ts < d.valid_to OR d.valid_to IS NULL);
~~~

A fact should match exactly one eligible dimension version under this model. A left join preserves unresolved facts for investigation; an inner join can silently drop them. Check for duplicate surrogate keys, multiple current rows, overlapping intervals and gaps where continuous coverage is required.

## Late facts, late dimensions and corrections

A July sale arriving in September still needs the July-valid region. Joining to today's current row rewrites its meaning. When the relevant dimension is missing, an unknown or inferred member can retain the fact until the actual attributes arrive. Record which facts need reconciliation.

A correction backdated to March may split an existing interval and require rekeying or restating affected facts. Rebuilding only the current row leaves history wrong. Process all relevant versions in source order, and define whether a correction changes historical truth or only fixes a previously recorded mistake.

**Valid time** describes when the value applies in the business. **System time** records when the platform knew it. A bitemporal design retains both, allowing “what was true then?” and “what did our report believe at that time?” to differ.

dbt snapshots preserve detected row changes using the configured strategy. A periodic snapshot cannot recover every intermediate source change between observations. Complete change history may require a retained change-data-capture (CDC) feed.

## Estimate history growth

For an illustrative fixed population of two million customers, assume 2% receive one new Type 2 version per month. That adds 40,000 rows monthly and 960,000 over 24 months: 2.96 million total rows before retention changes. At an assumed 300 bytes per stored row, the logical payload is about 888 MB; indexes, compression, replicas and variable-width values change physical storage.

Measure actual change frequency per tracked attribute. A volatile “last seen” field can create a new dimension version for almost every event; moving that observation to an event fact may better express the domain.
