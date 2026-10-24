---
title: "Data models, keys and relationship cardinality"
description: "Model entities and relationships, choose physical representations and detect duplication caused by the wrong grain."
chapter: "modelling"
order: 1
sequence: 151
level: "Core"
mermaid: true
keywords: ["conceptual model","logical model","physical model","normalization","one to many","many to many","document model","graph model","wide column"]
interview_queries: ["how do one to many joins duplicate rows","when should data be embedded or normalized"]
last_verified: "2026-10-25"
references: [{"title":"PostgreSQL constraints","url":"https://www.postgresql.org/docs/current/ddl-constraints.html"},{"title":"MongoDB data modelling","url":"https://www.mongodb.com/docs/manual/data-modeling/"},{"title":"Apache Cassandra data modelling","url":"https://cassandra.apache.org/doc/latest/cassandra/developing/data-modeling/index.html"}]
---

A model specifies what one record represents, how records relate and which changes are valid. An order, an order line, a payment attempt and a shipment are different entities even when a source API returns them in one document.

## Conceptual, logical and physical design

A conceptual model identifies business entities and relationships. A logical model assigns attributes, candidate keys and constraints. A physical model chooses tables or documents, types, indexes, partition keys and distribution. A diagram showing customer-to-order relationships cannot determine a useful partition key without query and traffic information.

A business key comes from the domain, such as an account number scoped to a tenant. A surrogate key is an assigned identifier. A composite key combines attributes; `(order_id, line_number)` can identify a line even when a product appears twice. A foreign key references another record's key. In systems without enforced foreign keys, ingestion checks and reconciliation must enforce the intended relationship.


{% capture diagram_1 %}
erDiagram
CUSTOMER ||--o{ SALES_ORDER : places
SALES_ORDER ||--|{ ORDER_LINE : contains
PRODUCT ||--o{ ORDER_LINE : identifies
SALES_ORDER ||--o{ PAYMENT_ATTEMPT : receives
CUSTOMER {
  bigint customer_id PK
  string tenant_id
}
SALES_ORDER {
  bigint order_id PK
  bigint customer_id FK
}
ORDER_LINE {
  bigint order_id PK, FK
  int line_number PK
  bigint product_id FK
  decimal line_amount
}
PRODUCT {
  bigint product_id PK
}
PAYMENT_ATTEMPT {
  bigint attempt_id PK
  bigint order_id FK
}
{% endcapture %}
{% capture fallback_1 %}
A customer can place zero or more orders. A completed order has one or more lines, each referencing one product. An order can have several payment attempts. A draft-order model may permit zero lines instead.
{% endcapture %}
{% include diagram.html title="Order entities and their relationship cardinalities" code=diagram_1 fallback=fallback_1 caption=true %}


The crow's-foot ends encode multiplicity. A circle permits zero; a bar means one; a crow's foot means many. Optionality is a business rule: the diagram above describes completed orders, while a draft may legitimately have no lines.

## One-to-one and many-to-many relationships

A separately secured customer profile may have an optional one-to-one relationship with a customer. Enforce uniqueness on its customer key; a foreign key alone allows many profiles.

Students and courses form a many-to-many relationship. An enrollment table makes that relationship explicit and can carry enrollment date, status and grade. Its unique key depends on whether repeat enrollment in the same course is allowed.


{% capture diagram_2 %}
erDiagram
STUDENT ||--o{ ENROLLMENT : has
COURSE ||--o{ ENROLLMENT : receives
STUDENT { bigint student_id PK }
COURSE { bigint course_id PK }
ENROLLMENT {
  bigint enrollment_id PK
  bigint student_id FK
  bigint course_id FK
  date enrolled_on
  string status
}
{% endcapture %}
{% capture fallback_2 %}
An enrollment links one student with one course. Multiple enrollments per student and per course implement a many-to-many relationship, with relationship-specific attributes.
{% endcapture %}
{% include diagram.html title="A relationship can have its own attributes" code=diagram_2 fallback=fallback_2 caption=true %}


Joining two independent one-to-many children can multiply rows. An order with three lines and two payment attempts produces six rows when both are joined directly. Preaggregate each child to order grain, or choose one relevant attempt with a deterministic rule. Reconcile totals before and after joins; `COUNT(DISTINCT order_id)` can conceal duplicated revenue.

## Match the representation to the access pattern

| Model | Example | Useful when | Cost or failure to investigate |
|---|---|---|---|
| Normalized relational | Customers, orders and line tables | Cross-entity constraints and updates matter | Joins and access paths need planning |
| Dimensional | Sales facts with customer/product dimensions | Repeated aggregation by business context | Grain, history and conformed definitions |
| Document | One order with embedded line items | Most requests read/change one aggregate | Unbounded arrays and duplicated customer attributes |
| Key-value | Session ID mapped to session state | Access is primarily by known key | Secondary queries require additional structures |
| Wide-column | Device partition with timestamp-clustered readings | Query-driven, distributed range access | Hot or oversized partitions |
| Property graph | Supplier nodes connected by ownership edges | Relationship traversal dominates | Maintaining edges, permissions and traversal cost |

A wide-column model such as Cassandra's partition-and-clustering-key design differs from a columnar analytical file such as Parquet. The first organizes distributed access by key; the second reduces bytes read in analytical scans.

Document embedding can make one aggregate easier to retrieve, while references avoid copying mutable records into thousands of documents. A graph can resolve multi-hop relationships, while a relational recursive query may suffice for a bounded hierarchy. One platform can expose several representations of the same authoritative records.

## Validate the model against changes

Test duplicate business keys, missing parents, a product repeated in one order, a customer deletion and an update arriving before its parent. Decide whether to reject, quarantine, create an inferred member or defer a record. Deletion behavior must respect financial retention and privacy rules.

[Normalization and functional dependencies]({{ '/sql/design/normalization/' | relative_url }}) explains decomposition. [Dimensional grain]({{ '/data-engineering/modelling/dimensional-facts-schemas/' | relative_url }}) follows the same orders into analytical tables.
