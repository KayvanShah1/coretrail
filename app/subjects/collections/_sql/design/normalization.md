---
title: "Normalization & functional dependencies"
description: "Reduce update anomalies by storing each fact at its natural grain."
chapter: "design"
order: 1
sequence: 801
level: "Core"
references: [{"title":"PostgreSQL relational concepts","url":"https://www.postgresql.org/docs/current/tutorial-concepts.html"}]
---

## Identify the dependency

Suppose every order line repeats `customer_name`, `customer_city`, and `product_name`. Updating a customer's city now requires changing many rows. Partial updates can leave contradictory values.

A functional dependency `customer_id → customer_name` means a customer ID determines one name under the model's rules. Decomposition puts customer attributes in `customers`, product attributes in `products`, and purchases in order tables.

## Common normal forms

| Form | Main idea | Example violation |
|---|---|---|
| 1NF | Represent attributes as values in a relational design; no repeating column groups | `product_1`, `product_2`, `product_3` |
| 2NF | No non-key attribute depends on only part of a candidate key | Product name depends only on product ID inside a composite order-line key |
| 3NF | Remove inappropriate transitive dependencies of non-key attributes on keys | Customer city stored on every order even though determined by customer ID |
| BCNF | Every determinant of a nontrivial dependency is a superkey | A dependency on a non-key determinant remains |

These descriptions are revision shorthand; formal definitions use candidate keys and dependencies. An array column supported by a database is not automatically an appropriate normalized representation of a business relationship.

## A simple decomposition

```sql
SELECT o.order_id, c.name, p.product_id, i.quantity
FROM orders o
JOIN customers c ON c.customer_id = o.customer_id
JOIN order_items i ON i.order_id = o.order_id
JOIN products p ON p.product_id = i.product_id;
```

The joins reassemble a report without duplicating descriptive facts in every source row.

## When denormalization helps

A reporting table may intentionally duplicate attributes to simplify analytical reads. That introduces maintenance responsibilities: refresh logic, consistency, and history rules. “More normalized is always faster” and “joins are always bad” are both unreliable claims.

An interview answer should connect the design to read/write patterns and update anomalies. Start with the entities and dependencies, then discuss measured reasons to denormalize.

[Data models, keys and relationship cardinality]({{ '/data-engineering/modelling/models-keys-relationships/' | relative_url }}) adds entity diagrams, many-to-many relationships and document/graph/wide-column trade-offs.
