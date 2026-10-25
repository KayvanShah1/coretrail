---
title: "Dimensional modelling, star schemas and fact grain"
description: "Choose facts, dimensions and history from the business process, then reason through additive measures and many-to-many allocation."
chapter: "modelling"
order: 2
sequence: 152
level: "Core"
keywords: ["star schema","snowflake schema","transaction fact","periodic snapshot","accumulating snapshot","factless fact","conformed dimension","bridge table"]
interview_queries: ["star schema vs snowflake","transaction fact vs periodic snapshot"]
last_verified: "2026-10-25"
references: [{"title":"Kimball dimensional modelling techniques","url":"https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/"},{"title":"Microsoft star schema guidance","url":"https://learn.microsoft.com/en-us/power-bi/guidance/star-schema"},{"title":"Kimball enterprise bus matrix","url":"https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/enterprise-data-warehouse-bus-matrix/"}]
---

For a sales model, declare the grain as one sold order line before naming dimensions or measures. Quantity and line revenue belong at that grain. An order-level shipping fee repeated on every line requires an allocation rule or a separate order-grain fact.

## Star and snowflake layouts

A star keeps descriptive attributes within dimensions surrounding a fact. Date, customer and product keys identify the context of each measurement. Dimensions can use surrogate keys so facts reference the intended historical version.


{% include figure.html id="sales-star" %}


A snowflake separates a hierarchy into related dimension tables, such as product, subcategory and category. It reduces repeated hierarchy attributes and can simplify centralized maintenance, while consumers navigate more joins. Query engines, cached data and table sizes determine whether this improves performance.


{% include figure.html id="product-snowflake" %}


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

{% include figure.html id="conformed-dimensions" %}

A sale credited to two representatives is many-to-many. A bridge can assign weights 0.6 and 0.4, producing attributed revenue of 60 and 40 for a 100-unit sale. Without weights, counting full revenue for both representatives yields 200; that may be deliberate participation reporting, but it is not allocated company revenue. Check that weights sum to one for the relevant effective interval.

When comparing separate facts, aggregate each fact to compatible conformed keys before joining. Joining detailed sales lines directly to detailed support tickets by customer produces fanout.

{% include figure.html id="multivalued-dimension" %}

## Grain, key and temporal validation

Validate the declared fact key, dimension-key uniqueness, orphan rates, temporal match counts and reconciliation totals. A metric that changes after adding a descriptive join suggests non-unique dimension keys or temporal overlaps. A growing unknown-member rate suggests missing dimensions, late-arriving references or a failed mapping.

A wide reporting table may simplify a repeated workload; [One Big Table and training grain]({{ '/data-engineering/modelling/one-big-table-feature-data/' | relative_url }}) covers its maintenance costs. [Slowly changing dimensions]({{ '/data-engineering/modelling/scd-temporal-history/' | relative_url }}) explains how dimension changes affect these facts.
