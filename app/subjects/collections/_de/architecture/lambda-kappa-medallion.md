---
block_diagrams: true
title: "Lambda, Kappa, medallion and hybrid processing"
description: "Compare live and historical computation, correction paths and quality layers without treating them as interchangeable architecture labels."
chapter: "architecture"
order: 2
sequence: 177
level: "Core"
keywords: ["Lambda architecture","Kappa architecture","medallion","bronze silver gold","batch streaming hybrid","reprocessing","event sourcing","CQRS"]
interview_queries: ["Lambda vs Kappa architecture","can medallion architecture be streaming"]
last_verified: "2026-10-25"
references: [{"title":"Jay Kreps: Questioning the Lambda Architecture","url":"https://www.oreilly.com/radar/questioning-the-lambda-architecture/"},{"title":"Databricks medallion architecture","url":"https://docs.databricks.com/gcp/en/lakehouse/medallion"},{"title":"Martin Fowler: Event Sourcing","url":"https://martinfowler.com/eaaDev/EventSourcing.html"},{"title":"Martin Fowler: CQRS","url":"https://martinfowler.com/bliki/CQRS.html"},{"title":"Apache Flink state evolution","url":"https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/fault-tolerance/serialization/schema_evolution/"}]
---

A dashboard needs updates within seconds, while finance needs corrected daily totals. Late events, source revisions and new business rules can change old results. The architecture must explain how live estimates and historical truth converge.

## Lambda: live results plus historical recomputation

Lambda commonly maintains a batch path over retained history and a low-latency speed path for recent data. Serving combines their results under a defined cutoff.


{% include block-diagram.html id="lambda" %}


The difficult part is reconciliation. When a batch view advances, its coverage replaces the corresponding speed result. Independent implementations can disagree about rounding, deduplication or late events. Shared transformation definitions and explicit version/cutoff metadata reduce that risk.

Choose separate paths when low-latency and large historical computation genuinely need different execution strategies and the team can maintain their consistency. A batch-only pipeline is often sufficient when a few minutes of delay meets the product requirement.

## Kappa: recompute by replaying through a stream-processing path

Kappa emphasizes a retained log and a stream-processing computation that can process new data or replay old data. A replacement processor can rebuild a separate output, catch up, validate and switch consumers.


{% include block-diagram.html id="kappa" %}


Replay requires enough retained history and compatible schemas, reference data and processing logic. Resetting a consumer offset without resetting or isolating state can double-count old events. If history has expired, recovery may need an object-store archive or a new source snapshot.

Changing keys, windows or aggregation semantics can require a state migration or complete rebuild. A unified batch/stream API can reduce duplicated logic while still using different execution plans.

## Medallion describes data quality and responsibility

Bronze, silver and gold commonly describe source-oriented, validated/conformed and consumer-oriented datasets. They need contracts such as source provenance, key uniqueness and accepted lateness. Those responsibilities can be implemented with different schedules, storage systems and numbers of physical tables.

A silver contract can remain stable while versioned adapters handle upstream schema changes. Unknown fields can remain in raw records until a mapping is approved. A streaming topology can implement the same quality responsibilities with stateful operators and durable outputs.

A lakehouse using medallion layers can contain a Data Vault integration model and Kimball stars in its presentation layer. Lambda/Kappa concerns how results are computed and rebuilt; these choices describe different parts of that system.


{% include block-diagram.html id="medallion-models" %}

The [schema-contract reference]({{ '/data-engineering/reliability/schema-evolution-and-contracts/' | relative_url }}) explains stable Silver mappings and consumer migrations. The [lake design reference]({{ '/data-engineering/architecture/lake-warehouse-design/' | relative_url }}) places catalogs, table commits and serving engines around these datasets.

## Event sourcing and CQRS solve another problem

**Event sourcing** makes the event history the application's authoritative record. **Command Query Responsibility Segregation (CQRS)** separates write operations from read models. An ordinary change-data-capture feed derived from mutable database rows is not automatically an event-sourced domain model.

An event-sourced service may publish a warehouse projection, but replay must suppress or reconcile external side effects such as charging a card or sending an email. Analytical replay rebuilds data with business side effects disabled or reconciled.

## A hybrid with bounded responsibilities

Use streaming for a fraud feature that needs second-level freshness, periodic warehouse jobs for settled financial reports, and an archive for reconstruction. Label provisional versus finalized measures, share source identifiers and define when late changes restate history.

| Requirement | Starting direction | Evidence that the choice needs revision |
|---|---|---|
| Hourly or daily reports | Batch / micro-batch | Freshness misses a business decision |
| Fast view plus independent historical repair | Lambda-style paths | Reconciliation and duplicate logic dominate cost |
| Retained events and replayable state | Kappa-style computation | Expired history or incompatible state blocks rebuild |
| Progressive validation and consumer contracts | Medallion responsibilities | Copies add latency without improving quality |
| Several legitimate latency needs | Bounded hybrid | Overlapping ownership creates conflicting truth |

A hybrid needs a purpose, publication contract and repair procedure for every path. [Recovery and backfills]({{ '/data-engineering/reliability/recovery-replay-backfills/' | relative_url }}) works through that procedure.
