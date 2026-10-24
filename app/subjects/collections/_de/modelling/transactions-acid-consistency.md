---
title: "ACID, transactional workloads and cross-system consistency"
description: "Follow transaction guarantees through relational writes, lakehouse commits, distributed coordination and safe event publication."
chapter: "modelling"
order: 4
sequence: 154
level: "Core"
mermaid: true
keywords: ["ACID","BASE","CAP","OLTP","OLAP","HTAP","MVCC","isolation","two phase commit","saga","transactional outbox","optimistic concurrency"]
interview_queries: ["ACID vs eventual consistency","outbox vs two phase commit vs saga"]
last_verified: "2026-10-25"
references: [{"title":"AWS ACID and BASE comparison","url":"https://aws.amazon.com/compare/the-difference-between-acid-and-base-database/"},{"title":"PostgreSQL transaction tutorial","url":"https://www.postgresql.org/docs/current/tutorial-transactions.html"},{"title":"PostgreSQL isolation semantics","url":"https://www.postgresql.org/docs/current/transaction-iso.html"},{"title":"PostgreSQL prepared transactions","url":"https://www.postgresql.org/docs/current/sql-prepare-transaction.html"},{"title":"Delta concurrency control","url":"https://docs.delta.io/concurrency-control/"},{"title":"Debezium outbox event router","url":"https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html"}]
---

An order service needs to reserve inventory, record a payment reference and publish an event. Those effects can cross databases and messaging services. Establish which system owns each invariant and which effects can commit together before choosing a transaction mechanism.

## Workload types and transaction properties

**Online transaction processing (OLTP)** handles short record-oriented operations, such as placing an order. **Online analytical processing (OLAP)** scans and aggregates many records for reporting. **Hybrid transactional/analytical processing (HTAP)** combines both access patterns within a platform, with implementation-specific isolation of analytical work. These are workload categories; an analytical table can still have transactional commits.

**Atomicity, consistency, isolation and durability (ACID)** describe transaction behavior:

| Property | Concrete example | What must be configured or designed |
|---|---|---|
| Atomicity | Debit and credit commit together or neither remains | One transaction spanning both writes |
| Consistency | Inventory never violates a declared constraint | Correct application rules and enforced constraints |
| Isolation | Concurrent reservations preserve the intended invariant | Suitable isolation, locking or version checks |
| Durability | Acknowledged commits survive the promised failures | Log persistence, replication and recovery settings |

ACID consistency concerns invariants. Distributed-replica consistency concerns what reads observe across copies. A system may enforce one scope while exposing stale reads in another. Document the guarantee and the failure condition.

## Eventual consistency and partitions

Some derived read models update asynchronously after an authoritative transaction. A client can therefore observe old state until propagation catches up. The BASE shorthand (Basically Available, Soft state, Eventual consistency) describes asynchronous, convergent state. Ordering, convergence and durability still need an explicit protocol.

Define acceptable staleness, read-your-writes behavior and how duplicate, reordered or deleted events converge. A wallet balance may require an authoritative read even when a recommendation profile can tolerate a delayed projection.

The consistency, availability and partition-tolerance (CAP) trade-off concerns coordination across replicas during a network partition. Under a partition, a distributed system cannot promise both linearizable operations and availability for all requests. The design still needs to specify normal-operation latency and which operations wait or reject when coordination is unavailable.

## Isolation and concurrent writers

At PostgreSQL Read Committed, ordinary statements can see different committed snapshots. PostgreSQL Repeatable Read maintains a transaction snapshot, but can still permit serialization anomalies. Serializable prevents those outcomes among committed transactions by detecting conflicts and sometimes aborting work; callers need whole-transaction retry logic.

Multi-version concurrency control (MVCC) lets readers use consistent record versions while writers create newer ones. Conflicting writes can still wait or fail. Long-running transactions can retain old versions and create maintenance pressure.

An optimistic update can require `WHERE entity_id = ? AND version = ?` and increment the version. Zero affected rows means the expected state no longer matches. Re-read and decide whether the business operation remains valid; blindly replaying stale arguments can violate the invariant.

The [SQL transaction chapter]({{ '/sql/transactions/overview/' | relative_url }}) provides savepoint, isolation and locking examples.

## Table commits and publication scope

A lakehouse writer can prepare data files, validate a candidate table change and commit a new metadata version. Readers following the table protocol see the committed snapshot. Directly listing files bypasses that interpretation and may expose abandoned or superseded files.

A table commit publishes that table's change. Publishing several marts, an external API and a message together requires a larger protocol supported by the catalog or runtime. For a set of related outputs, a release manifest can identify the snapshots consumers should read together.

## Two-phase commit, sagas and transactional outbox

**Two-phase commit (2PC)** prepares participating resources, then commits them under a coordinator's decision. Prepared participants may hold resources while awaiting resolution. All participants must support the protocol; an ordinary HTTP request is not automatically enlisted.

A **saga** coordinates local transactions with compensating actions. Refunding a payment compensates a prior charge; it does not erase the original business event or guarantee that a notification was never observed. Compensation can fail and needs its own durable status.

A **transactional outbox** commits the business record and an event record in one local transaction, then a relay publishes the event:


{% capture diagram_2 %}
flowchart TD
A["Order operation"] --> T["Database transaction"]
T --> B["Order and inventory rows"]
T --> O["Outbox row with stable event ID"]
B --> C["Commit both or roll back both"]
O --> C
C --> R["Relay reads committed outbox"]
R --> M["Publish message"]
M --> D["Consumer deduplicates and applies effect"]
R -. "Crash or uncertain delivery" .-> R
{% endcapture %}
{% capture fallback_2 %}
The local transaction commits order state and an outbox record together. A relay publishes committed events and can retry. Consumers deduplicate stable event IDs.
{% endcapture %}
{% include diagram.html title="One local commit makes event publication recoverable" code=diagram_2 fallback=fallback_2 caption=true %}


The relay can publish successfully and crash before recording progress. Duplicate delivery remains possible, so consumers use stable event IDs and idempotent writes. A transactionally published event also needs a meaningful order or source version if later updates can arrive first.

## Choosing transaction scope

Use a local transaction when the operation fits one transactional store. Consider supported distributed transactions when a strict multi-resource atomic invariant justifies coordination. Use outbox delivery for reliable propagation from committed state. Use a saga when a business process tolerates intermediate states and compensation.

Fail closed when required authorization or monetary invariants cannot be checked. For analytical publication, retaining the last verified release can be safer than exposing a partially refreshed set; label its freshness so consumers can make an informed decision.
