---
title: "Dimensional modelling, star schemas and fact grain"
description: "Choose facts, dimensions and history from the business process, then reason through additive measures and many-to-many allocation."
chapter: "modelling"
order: 2
sequence: 152
level: "Core"
mermaid: true
keywords: ["star schema","snowflake schema","transaction fact","periodic snapshot","accumulating snapshot","factless fact","conformed dimension","bridge table"]
interview_queries: ["star schema vs snowflake","transaction fact vs periodic snapshot"]
last_verified: "2026-10-25"
references: [{"title":"Kimball dimensional modelling techniques","url":"https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/"},{"title":"Microsoft star schema guidance","url":"https://learn.microsoft.com/en-us/power-bi/guidance/star-schema"},{"title":"Kimball enterprise bus matrix","url":"https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/enterprise-data-warehouse-bus-matrix/"}]
---

For a sales model, declare the grain as one sold order line before naming dimensions or measures. Quantity and line revenue belong at that grain. An order-level shipping fee repeated on every line requires an allocation rule or a separate order-grain fact.

## Star and snowflake layouts

A star keeps descriptive attributes within dimensions surrounding a fact. Date, customer and product keys identify the context of each measurement. Dimensions can use surrogate keys so facts reference the intended historical version.


{% capture diagram_3 %}
erDiagram
DIM_DATE ||--o{ FACT_SALES : dates
DIM_CUSTOMER ||--o{ FACT_SALES : describes
DIM_PRODUCT ||--o{ FACT_SALES : categorizes
DIM_DATE { int date_key PK }
DIM_CUSTOMER {
  bigint customer_key PK
  string customer_id
  string region
}
DIM_PRODUCT {
  bigint product_key PK
  string category
}
FACT_SALES {
  bigint order_id
  int line_number
  int date_key FK
  bigint customer_key FK
  bigint product_key FK
  decimal quantity
  decimal net_revenue
}
{% endcapture %}
{% capture fallback_3 %}
Date, customer and product dimensions each join to order-line sales facts. Many facts can reference the same dimension version.
{% endcapture %}
{% include diagram.html title="A sales star with one fact row per order line" code=diagram_3 fallback=fallback_3 caption=true %}


A snowflake separates a hierarchy into related dimension tables, such as product, subcategory and category. It reduces repeated hierarchy attributes and can simplify centralized maintenance, while consumers navigate more joins. Query engines, cached data and table sizes determine whether this improves performance.


{% capture diagram_4 %}
erDiagram
CATEGORY ||--o{ SUBCATEGORY : groups
SUBCATEGORY ||--o{ PRODUCT : groups
PRODUCT ||--o{ SALES_LINE : describes
CATEGORY { int category_key PK }
SUBCATEGORY {
  int subcategory_key PK
  int category_key FK
}
PRODUCT {
  bigint product_key PK
  int subcategory_key FK
}
SALES_LINE {
  bigint order_id
  bigint product_key FK
}
{% endcapture %}
{% capture fallback_4 %}
A sales line joins to a product; product joins to subcategory, then category. The hierarchy is normalized across dimension tables.
{% endcapture %}
{% include diagram.html title="A snowflaked product hierarchy" code=diagram_4 fallback=fallback_4 caption=true %}


Choose the hierarchy's history policy explicitly. Moving a product between categories can either restate historical sales under today's category or preserve the category at sale time.

## Fact-table patterns describe different measurements

| Pattern | One row represents | Example | Update behavior |
|---|---|---|---|
| Transaction fact | One event or event line | Sale, payment, meter reading | Append events; reconcile corrections |
| Periodic snapshot | One entity at one regular cutoff | Account balance per day | Publish a complete interval |
| Accumulating snapshot | One process instance with milestones | Order with placed/shipped/delivered times | Update as milestones arrive |
| Factless fact | One event or eligibility relationship | Attendance or promotion eligibility | Relationship/event itself is the measurement |
| Aggregate fact | One summarized combination | Daily store/product revenue | Rebuild affected groups after detail changes |

An accumulating snapshot may conceal changes to earlier milestones unless another history mechanism preserves them. A periodic snapshot needs a completeness rule: absence can mean no activity, missing extraction or an inactive entity.

## Additivity determines valid aggregation

Line revenue is usually additive across compatible dimensions after currency and tax conventions agree. A daily closing balance is semi-additive: summing accounts at a point in time is useful, while summing the same account across days usually is not. A conversion percentage is non-additive; aggregate conversions and eligible attempts, then recompute the ratio.

Returns and reversals need explicit event semantics. Recording a refund as a negative revenue event can preserve an audit trail, while restating an earlier sale answers a different question. A metric contract should identify the policy.

## Shared dimensions and bridge allocation

Conformed dimensions let several business processes use compatible customer, date or product definitions. A bus matrix lists business processes against these shared dimensions, revealing where cross-process analysis is possible.

{% capture conformed_code %}
erDiagram
DIM_DATE ||--o{ FACT_SALES : dates
DIM_DATE ||--o{ FACT_INVENTORY : dates
DIM_PRODUCT ||--o{ FACT_SALES : describes
DIM_PRODUCT ||--o{ FACT_INVENTORY : describes
DIM_DATE { int date_key PK }
DIM_PRODUCT { bigint product_key PK }
FACT_SALES {
 bigint sale_line_key PK
 int date_key FK
 bigint product_key FK
 decimal revenue
}
FACT_INVENTORY {
 bigint snapshot_key PK
 int date_key FK
 bigint product_key FK
 bigint warehouse_key FK
 decimal closing_quantity
}
{% endcapture %}
{% capture conformed_fallback %}
Sales has one row per sale line; inventory has one row per product, warehouse and day. Date and product definitions are shared. Aggregate each fact to compatible keys before combining its measures.
{% endcapture %}
{% include diagram.html title="Conformed dimensions connect facts at different grains" code=conformed_code fallback=conformed_fallback caption=true %}

A sale credited to two representatives is many-to-many. A bridge can assign weights 0.6 and 0.4, producing attributed revenue of 60 and 40 for a 100-unit sale. Without weights, counting full revenue for both representatives yields 200; that may be deliberate participation reporting, but it is not allocated company revenue. Check that weights sum to one for the relevant effective interval.

When comparing separate facts, aggregate each fact to compatible conformed keys before joining. Joining detailed sales lines directly to detailed support tickets by customer produces fanout.

{% capture bridge_code %}
erDiagram
CUSTOMER ||--o{ CUSTOMER_ACCOUNT : owns
ACCOUNT ||--o{ CUSTOMER_ACCOUNT : has_owners
ACCOUNT ||--o{ ACCOUNT_TRANSACTION : records
CUSTOMER { bigint customer_key PK }
ACCOUNT { bigint account_key PK }
CUSTOMER_ACCOUNT {
 bigint customer_key PK, FK
 bigint account_key PK, FK
}
ACCOUNT_TRANSACTION {
 bigint transaction_key PK
 bigint account_key FK
 decimal amount
}
{% endcapture %}
{% capture bridge_fallback %}
Customer-account membership implements a many-to-many relationship. Transactions retain account grain. A transaction can match several owners; attributing its amount to them needs an explicit allocation policy.
{% endcapture %}
{% include diagram.html title="A bridge records account ownership without changing transaction grain" code=bridge_code fallback=bridge_fallback caption=true %}

## Grain, key and temporal validation

Validate the declared fact key, dimension-key uniqueness, orphan rates, temporal match counts and reconciliation totals. A metric that changes after adding a descriptive join suggests non-unique dimension keys or temporal overlaps. A growing unknown-member rate suggests missing dimensions, late-arriving references or a failed mapping.

A wide reporting table may simplify a repeated workload; [One Big Table and training grain]({{ '/data-engineering/modelling/one-big-table-feature-data/' | relative_url }}) covers its maintenance costs. [Slowly changing dimensions]({{ '/data-engineering/modelling/scd-temporal-history/' | relative_url }}) explains how dimension changes affect these facts.
