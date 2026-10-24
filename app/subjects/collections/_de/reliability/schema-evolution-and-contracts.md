---
title: "Schema evolution, data contracts, and safe migrations"
description: "Handle source changes across event ingestion, curated warehouse models, and downstream consumers."
chapter: reliability
order: 2
sequence: 702
level: Core
keywords:
  - schema evolution
  - schema drift
  - data contracts
  - Bronze Silver Gold
  - schema registry
  - expand and contract
  - backward compatibility
  - dbt model contracts
  - downstream lineage
interview_queries:
  - how do companies handle schema evolution at scale
  - how does schema evolution work in the silver layer
  - how do you migrate a breaking data contract without downtime
---

A producer renames `amount` to `total_amount`. Raw ingestion continues, but a Silver model that selects `amount` might fail or start returning nulls. Dashboards, feature pipelines and finance reports can still depend on the existing column and its meaning. The team needs to decide whether ingestion can accept the change, how curated mappings should be updated, and when affected consumers can migrate.

## Drift, evolution, and contracts

**Schema drift** is the difference between the structure you expected and what arrived. **Schema evolution** is the mechanism and process used to accept or migrate that difference. A **data contract** states the expectations that a producer or published dataset commits to: field names, types, required fields, sometimes meaning, ownership, freshness and compatibility rules.

A schema registry can approve a structurally compatible event while leaving the business meaning uncertain. For example, an `amount` field could start including tax or switch currency without changing its type. That calls for review of the calculation and its consumers even if the schema check passes.

| Producer change | Ingestion decision | Silver / serving consequence |
| --- | --- | --- |
| Add an optional, nullable field | Usually compatible under the chosen rules | Existing explicit projections can remain unchanged; add the field only if consumers need it |
| Rename or remove a field | Usually breaking for readers using the old name | Map known source versions, coordinate a migration or publish a new model version |
| Change `INTEGER` to `STRING` | Depends on encoding and compatibility mode | Parsing, joins, null handling and historical data may need changes |
| Change the meaning or units of `amount` | Structural validation may pass | Requires a business decision, reconciliation and often a new metric or version |
| Add a column to a curated output | Deliberate model change | Check compatibility with consumers and backfill expectations |

Compatibility also depends on direction. A *backward-compatible* schema lets a newer reader consume older data; a *forward-compatible* schema lets an older reader consume newer data, under the serialization system's definitions. Backward, forward and full compatibility are different registry policies. A nullable addition can be allowed in one format or policy and rejected in another.

## Bronze, Silver and Gold: handling upstream changes

In a medallion warehouse, raw, curated and serving datasets have different responsibilities. An online event-driven service may instead process typed Kafka or Pub/Sub messages directly. For producer/consumer rollout order and stream state migration, see [Schema evolution in real-time pipelines]({{ '/data-engineering/processing/streaming-schema-evolution/' | relative_url }}).

**Bronze / raw:** Retain a recoverable copy of the source event, ideally including its event ID, event time, ingestion time, schema version and original payload. Avro or a schema registry supports versioned structure; JSON or variant payloads can accommodate less structured input. Ingestion can still validate envelopes and quarantine unreadable events.

**Silver / staging and core:** Explicit SQL, dbt or Spark logic normalizes source versions into an agreed representation: casts, deduplication, field mappings, keys and quality checks. A well-defined Silver model will often *keep the same output schema* when the producer changes. Its transformation code or declarative mapping is updated to absorb the source change. Silver itself evolves deliberately when the business needs a new attribute, grain or definition.

**Gold / serving:** Published tables and metrics have identifiable consumers. Changes to names, types, grain and business definitions follow a planned release. Views, stable aliases or versioned models can support both old and new consumers during migration. Adding a compatible output column is usually easier than changing the definition of `net_revenue` used in financial reports.

Warehouse and lakehouse table-evolution features update physical or catalog schemas. An upstream field still needs a mapping into the curated model, and consumers still need to agree on its meaning.

## A source rename without a Gold schema change

Suppose version 1 of an order event has `amount`, and version 2 has `total_amount`. Raw events are retained in `bronze.orders` as a BigQuery JSON `payload` plus an integer `schema_version`:

~~~json
{"schema_version": 1, "payload": {"order_id": 101, "amount": "500.00"}}
{"schema_version": 2, "payload": {"order_id": 102, "total_amount": "600.00"}}
~~~

Silver explicitly maps both supported versions to the same canonical column:

~~~sql
SELECT
  SAFE_CAST(JSON_VALUE(payload, '$.order_id') AS INT64) AS order_id,
  CASE schema_version
    WHEN 1 THEN SAFE_CAST(JSON_VALUE(payload, '$.amount') AS NUMERIC)
    WHEN 2 THEN SAFE_CAST(JSON_VALUE(payload, '$.total_amount') AS NUMERIC)
  END AS order_amount
FROM bronze.orders;
~~~

The mapping is valid only if both amount fields use the *same business definition and units*. Malformed values and unknown schema versions would produce nulls in this example. A production job should classify and quarantine those records or fail validation, with alerts on the invalid rate. Simply using `SAFE_CAST` could conceal the change.

Silver still publishes `order_id, order_amount`, so existing Gold models can continue using that interface. The version-specific logic changed inside Silver. A configuration-driven mapping can reduce repetitive SQL, provided the source-to-target semantics and tests remain explicit.

If version 2 instead changes from gross to net amount, the normalization above would be wrong even though it executes successfully. A domain owner must decide whether to add another column, change the metric definition with a versioned release, or retain both.

## Expand-and-contract migrations for shared models

A typical mature-team workflow starts with a producer pull request. The proposed event or database schema diff goes through compatibility checks and tests. Metadata and lineage identify the datasets, jobs and teams that consume the affected field. For incompatible changes, the data model owner reviews mappings and updates the transformation in a separate change or coordinated release.

Suppose hundreds of consumers read `gold.payments.amount`, and the team wants to introduce `net_amount`:

1. **Expand:** Introduce `net_amount` without immediately removing `amount`. Keep both available if their definitions are valid and reconcile them over representative records.
2. **Migrate:** Publish and test an updated Silver model and a `payments_v2` serving model or view. Find affected consumers using lineage, code search and ownership metadata. Move each consumer deliberately, with a documented deprecation window.
3. **Contract:** Once consumers have migrated, retire the old field or old version. Confirm no scheduled jobs, dashboards, exports or machine-learning features still depend on it.

This rollout is called *expand-and-contract*. A private staging model with one owning team might be changed directly. A widely used payments model benefits from versions and a migration window because independent consumers cannot all deploy at once.

## Schema checks and semantic validation in CI

Continuous integration (CI) can compare a new schema with the last deployed version, test compatibility rules, compile SQL models, evaluate contracts and run representative transformations. A release pipeline can update a schema registry or catalog only after approval. For a critical dataset, the following checks cover different failure modes:

- **Shape:** Column names, types, required fields, approved versions and serialization compatibility.
- **Content:** Null and invalid-value rates, accepted enum values, ranges and unit assumptions.
- **Grain:** Unique business keys, duplicate handling and one-to-many join multiplication.
- **History:** Replaying older raw versions and checking an incremental run or backfill.
- **Consumers:** Lineage impact, owner approval, a migration/deprecation plan and tests for affected downstream queries.
- **Operations:** Quarantine count, failed writes, freshness, reconciliation totals and a way to repair already-published data.

A compatible field type says little about whether the business calculation is still correct. Lineage can locate many dependent jobs, although dynamic SQL, spreadsheet extracts and external exports may escape tracking. When the consumer inventory is incomplete, stable published contracts and a migration window reduce the risk of unnoticed breakage.

Reverting code leaves rows written during the faulty release in place. Recovering the dataset may require rebuilding affected partitions from raw data and reconciling corrected output.

## dbt model contracts and BigQuery schema evolution

A dbt model can declare a schema contract in its YAML configuration:

~~~yaml
models:
  - name: payments
    config:
      contract:
        enforced: true
    columns:
      - name: payment_id
        data_type: string
      - name: order_amount
        data_type: numeric
~~~

This checks the model's declared output shape when it builds. Data-quality tests still have to check values, grain and meaning. For shared models, dbt model versions provide a formal way to serve a new contract alongside an older one.

For **incremental** dbt models, `on_schema_change` controls what happens when the *model's output columns* and existing target table differ. `fail` raises an error; `append_new_columns` can add columns; `sync_all_columns` can also remove missing columns and apply supported type changes. None of these modes backfills old rows for newly added columns. A stable Silver projection could hide an upstream rename from this check until a source-level test catches it.

BigQuery can add nullable or repeated fields and supports some column renames and type changes. A BigQuery load job can use `ALLOW_FIELD_ADDITION` when eligible. Those features alter table structure; they do not resolve whether an upstream `total_amount` is equivalent to the canonical `order_amount`. On BigQuery, dbt `sync_all_columns` type changes may scan the entire table, making the option especially costly or risky on large curated datasets.

For incremental ingestion, see [CDC, checkpoints and MERGE]({{ '/data-engineering/incremental/cdc-checkpoints-and-merge/' | relative_url }}). For lakehouse table-level evolution, see [Storage formats and lakehouse tables]({{ '/data-engineering/storage/parquet-lakehouse-and-grain/' | relative_url }}).

## Published engineering approaches

The published examples illustrate different parts of the system. They are not claims that every team at those companies uses the same architecture.

**Uber: compatibility at ingestion.** Uber's [DBEvents framework](https://www.uber.com/de/en/blog/dbevents-ingestion-framework/) describes an Avro Schema-Service that accepts backward-compatible schema changes and applies the corresponding table definition changes. It standardizes ingestion from heterogeneous sources. Domain-specific downstream transformations still need their own logic.

**Spotify: schema-driven events and consumer migrations.** Spotify's [data platform write-up](https://engineering.atspotify.com/2024/5/data-platform-explained-part-ii) describes event schemas triggering resource deployments and separate ownership of consumption datasets. In a [2026 migration case study](https://engineering.atspotify.com/2026/4/background-coding-agents-dataset-migrations-honk-part-4), two heavily used datasets had about 1,800 direct downstream pipelines. Spotify used Backstage lineage, code search and automated pull requests; it reported 240 automated migration PRs. The team had to specify field mappings explicitly, leave ambiguous cases for human engineers and rely on owning teams to test changes where build-time tests were missing. Automation helped with repetition, while migration decisions and validation remained necessary.

**LinkedIn: metadata checks before release.** LinkedIn's [DataHub governance account](https://www.linkedin.com/blog/engineering/data-management/shifting-left-on-governance-datahub-and-schema-annotations) describes schema annotations living with code and builds failing when event-tracking fields lack required business metadata. Its [DataHub architecture](https://www.linkedin.com/blog/engineering/archive/data-hub) also describes build-time compatibility checking for metadata event schemas. Build-time checks catch missing metadata before release. Downstream SQL still needs its own compatibility checks and updates.

**Airbnb: stable business definitions.** Airbnb's [Minerva write-up](https://medium.com/airbnb-engineering/how-airbnb-achieved-metric-consistency-at-scale-f23cc53dea70) describes curated core data models and a metric platform serving consistent definitions to different consumers. The [follow-up on Minerva's computation](https://medium.com/airbnb-engineering/airbnb-metric-computation-with-minerva-part-2-9afe6695b486) covers version-controlled declarative definitions, backfills and testing before release. It highlights why structural schema compatibility alone cannot make revenue or bookings metrics consistent.

## Choosing a schema-change policy

An internal staging table with one owning team can evolve quickly. A published payments model used by finance, fraud and external reports needs an owner, compatibility policy, consumer inventory and a migration window. Pick the level of ceremony from the number and importance of consumers.

For each proposed schema change, identify **the affected interface**, **which historic and current data must remain readable**, **who owns the canonical mapping**, **which consumers need updates**, and **how correctness will be verified**. That tells the team whether it needs a registry rule, configurable mapping, dbt contract or versioned serving model.

## References

- [Uber Engineering: DBEvents and Avro schema evolution](https://www.uber.com/de/en/blog/dbevents-ingestion-framework/)
- [Spotify Engineering: Data Platform Explained, Part II](https://engineering.atspotify.com/2024/5/data-platform-explained-part-ii)
- [Spotify Engineering: Dataset migrations across downstream pipelines (2026)](https://engineering.atspotify.com/2026/4/background-coding-agents-dataset-migrations-honk-part-4)
- [LinkedIn Engineering: DataHub schema annotations](https://www.linkedin.com/blog/engineering/data-management/shifting-left-on-governance-datahub-and-schema-annotations)
- [Airbnb Engineering: Minerva metric consistency](https://medium.com/airbnb-engineering/how-airbnb-achieved-metric-consistency-at-scale-f23cc53dea70)
- [dbt: Incremental schema-change handling](https://docs.getdbt.com/docs/build/incremental-models)
- [dbt: Model contracts and versions](https://docs.getdbt.com/docs/mesh/govern/about-model-governance)
- [Google Cloud: Modifying BigQuery table schemas](https://cloud.google.com/bigquery/docs/managing-table-schemas)
