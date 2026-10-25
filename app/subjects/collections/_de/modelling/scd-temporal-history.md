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

A customer's region changes from West to South. A report may need the region at purchase time, today's region for every past purchase, or both. Slowly changing dimension (SCD) policies encode that choice. A name correction and a sales-territory change can follow different policies in the same dimension.

## One customer change, two reporting questions

<aside class="scd-change" aria-label="Incoming customer change">
<strong>1 July 2026 · customer C42 · Asha Rao</strong>
<p>The sales region changes from <b>West</b> to <b>South</b>. The customer ID and name stay the same.</p>
</aside>

Before the change, the customer dimension has one row:

| Customer key | Customer ID | Name | Region |
|---|---|---|---|
| 101 | C42 | Asha Rao | West |

The business key **C42** identifies the customer in this example. The surrogate **customer key 101** identifies a warehouse row. Type 2 will allocate another surrogate when it creates a new version.

Two sales make the reporting consequence visible. Amounts are illustrative currency units.

| Sale | Sale date | Customer ID | Amount |
|---|---|---|---:|
| S01 | 15 June 2026 | C42 | 100 |
| S02 | 10 July 2026 | C42 | 150 |

The total is always **250**. The design decides whether June's 100 belongs to **West at sale time** or **South under today's customer classification**.

## Type 1: overwrite the attribute

After the July change, the existing dimension row contains:

| Customer key | Customer ID | Name | Region |
|---|---|---|---|
| 101 | C42 | Asha Rao | <mark class="scd-change-value">South</mark> |

The key remains **101**. Both sales can reference that row, so both now join to South. Reporting by current region gives **South = 250**. The dimension no longer contains West for this attribute.

Type 1 fits a corrected value or a reporting policy that deliberately applies the current classification to earlier facts. Audit history in a source log does not automatically become historical reporting through this dimension.

## A Type 2 change at an exact boundary

Type 2 closes the old version and inserts a new one. All rows below describe **customer C42, Asha Rao**:

| Customer key | Region | Valid from | Valid to | Version status |
|---|---|---|---|---|
| 101 | West | 1 Jan 2026 | 1 July 2026 | Closed |
| <strong>205</strong> | <mark class="scd-change-value">South</mark> | 1 July 2026 | NULL | Current |

The customer identity stays **C42**; the version key changes from **101 to 205**. NULL means the current version has no known end yet.

Use half-open intervals: row 101 covers <code>2026-01-01 &lt;= sale_ts &lt; 2026-07-01</code>. Row 205 starts exactly at <code>2026-07-01</code>. A sale at that instant matches **205 only**. Dates here represent midnight UTC; production timestamps need a consistent timezone and precision.

When facts are resolved against their sale time, they receive these keys:

| Sale | Sale date | Amount | Stored customer key | Region at sale |
|---|---|---:|---|---|
| S01 | 15 June 2026 | 100 | 101 | West |
| S02 | 10 July 2026 | 150 | 205 | South |

June's fact keeps 101. July's fact gets 205. Normal dimension changes leave those historical foreign keys intact.

| Reporting policy | S01 is grouped under | S02 is grouped under | Regional totals |
|---|---|---|---|
| Type 1, current classification | South | South | South 250 |
| Type 2, classification at sale time | West | South | West 100; South 150 |

The total agrees; the grouping answers a different question.

## Types 0 and 3: original or limited alternate values

**Type 0 retains an original attribute.** If the column is named original_region, the July move leaves this row unchanged:

| Customer ID | original_region |
|---|---|
| C42 | West |

Both sales are grouped under the customer's original region, giving **West = 250**. This does not claim that the customer still lives in West; the column's meaning is explicitly the original value.

**Type 3 adds a bounded alternate or previous-value column.** A one-previous-value design would look like this:

| Snapshot of the row | Customer ID | previous_region | current_region |
|---|---|---|---|
| After the July move | C42 | West | South |
| After a later September move to East | C42 | South | East |

The second row illustrates a later state of the same record, not two simultaneously stored dimension rows. With only these two region columns, West is no longer retained after September. Type 3 supports selected comparisons; it cannot reconstruct an unrestricted sequence of past classifications.

## Types 4 and 5: keep changing profiles in a mini-dimension

Consider the same customer changing from a **Low / Occasional** spending profile to **High / Frequent** on 1 July. These profile attributes are handled separately from region in this example.

Kimball's **Type 4** assigns a surrogate to each distinct profile combination:

| Profile key | Spend band | Engagement |
|---|---|---|
| 10 | Low | Occasional |
| 20 | High | Frequent |

These are reusable combinations: many customers can reference profile 20. A profile row is not a customer's individual history record.

The base customer row can retain key 101. Each sale stores both the customer key and the profile key that applied at sale time:

| Sale | Customer key | Profile key at sale | Amount |
|---|---|---|---:|
| S01 | 101 | 10 | 100 |
| S02 | 101 | 20 | 150 |

Joining through the fact's profile key gives **Low / Occasional = 100** and **High / Frequent = 150**. If every profile transition must be recorded, including periods without sales, the design needs a separate relationship/change record as well.

**Type 5 adds a current-profile pointer to the base dimension.** After July, overwrite that pointer:

| Customer key | Customer ID | current_profile_key |
|---|---|---|
| 101 | C42 | <mark class="scd-change-value">20</mark> |

The fact's profile key still answers "which profile applied at sale time?" The customer's current_profile_key answers "which profile applies now?" Following the current pointer groups both sales under **High / Frequent = 250**. Give historical and current profile columns distinct names in consumer models.

Types 4 and 5 here follow Kimball's terminology. Some material calls a separate history table "Type 4"; describing the stored keys and join paths avoids that ambiguity.

## Type 6: historical rows also carry current attributes

Type 6 retains Type 2 versions and adds current-value columns that are overwritten across all versions of the customer. After the July move:

| Customer key | region_at_version | current_region | Valid from | Valid to |
|---|---|---|---|---|
| 101 | West | <mark class="scd-change-value">South</mark> | 1 Jan 2026 | 1 July 2026 |
| 205 | South | <mark class="scd-change-value">South</mark> | 1 July 2026 | NULL |

S01 still joins to row 101. That row now exposes **West historically** and **South currently**. S02 joins to row 205 and sees South in both columns.

A later move to East would create another version and update current_region to East on every version for C42. The extra reporting flexibility comes with those repeated updates.

## Type 7: facts carry historical and durable lookup keys

Type 7 supports the same two reporting views through explicit join paths. Give C42 a warehouse **durable customer key 9001**, shared by every version. A durable key identifies the entity across versions; customer keys 101 and 205 identify individual versions.

| Sale | Historical customer key | Durable customer key | Amount |
|---|---|---|---:|
| S01 | 101 | 9001 | 100 |
| S02 | 205 | 9001 | 150 |

The dimension retains the Type 2 rows shown earlier, with customer_dk = 9001 on both. Consumers select a join path:

| Join path | S01 region | S02 region | Result |
|---|---|---|---|
| Historical key to customer_key | West | South | West 100; South 150 |
| Durable key to customer_dk, filtered to the current row | South | South | South 250 |

The **current-row filter is essential**. Joining on durable key alone matches both versions and duplicates each fact. A current view should expose at most one row per durable customer key.

Type 6 stores current attributes on historical rows. Type 7 keeps the reporting choice in the join and consumer view.

## Choose the policy by the question

| Requirement | Starting policy | What to make explicit |
|---|---|---|
| Preserve an original attribute | Type 0 | The column means original, not current |
| Correct or apply today's value to all facts | Type 1 | Earlier fact classifications change |
| Preserve the value effective for each fact | Type 2 | Version keys and non-overlapping intervals |
| Keep a limited alternate value | Type 3 | How many alternatives survive |
| Attach reusable, changing profiles to facts | Type 4 | Both entity and profile foreign keys |
| Add a customer's current profile | Type 5 | The overwritten current-profile pointer |
| Read historical and current attributes from a version row | Type 6 | Updates across all entity versions |
| Choose historical or current joins from facts | Type 7 | Dual keys and a unique current-row view |

## Publish the closed and new versions together


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
