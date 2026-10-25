---
title: "Resumable pipelines, replay, backfills and safe recovery"
description: "Design durable progress and idempotent effects, rebuild historical intervals and prove recovery before source history expires."
chapter: "reliability"
order: 5
sequence: 705
level: "Core"
mermaid: true
keywords: ["resumable","replayable","backfill","idempotency","checkpoint","RPO","RTO","disaster recovery","fail safe","fencing token"]
interview_queries: ["how to build resumable replayable pipelines","how to run safe backfills"]
last_verified: "2026-10-25"
references: [{"title":"Airflow backfill controls","url":"https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/backfill.html"},{"title":"Debezium PostgreSQL snapshot and offset behavior","url":"https://debezium.io/documentation/reference/stable/connectors/postgresql.html"},{"title":"Flink checkpoints and recovery","url":"https://nightlies.apache.org/flink/flink-docs-stable/docs/ops/state/checkpoints/"},{"title":"Delta Lake retention requirements","url":"https://docs.delta.io/delta-batch/"}]
---

A worker writes a batch and crashes before recording completion. Starting again may duplicate output; skipping it may lose records. Recovery needs evidence of what committed and a rule for repeating the same logical work safely.

## Resume, retry, replay and backfill

| Operation | Meaning | What must remain available |
|---|---|---|
| Retry | Repeat an unsuccessful or uncertain attempt | Stable operation identity and retry policy |
| Resume | Continue from persisted progress | Compatible checkpoint, state and input |
| Replay | Reprocess retained events or source records | Input history, schemas, reference versions and sink semantics |
| Backfill | Populate or recompute historical coverage | Explicit intervals, dependencies and publication rules |
| Restore | Recover persisted state/data from a backup | Consistent backups, logs, credentials and a tested procedure |

A checkpoint identifies progress in a particular computation. Changing state keys, source partitions or transformation logic can make an old checkpoint incompatible. Validate resume compatibility before treating a saved file as sufficient recovery.

## Make repeat execution converge

Use a stable business event ID and source version. A sink can insert missing keys, update only from newer versions and record deletes through tombstones or an equivalent protocol. The result of replay should converge to the intended state.

For an additive metric, repeating `total = total + batch_sum` doubles the contribution. Replace a deterministic interval contribution, or deduplicate source events before aggregation. For an external action, use the service's supported idempotency mechanism and reconcile uncertain outcomes.

A worker lease limits concurrent ownership, but an expired worker may still run. A fencing token or compare-and-swap generation checked by the sink prevents an older owner from committing after a replacement takes over. The sink's generation check enforces ownership when an old worker continues after its lease expires.


{% capture diagram_2 %}
flowchart TD
F["Interrupted or uncertain run"] --> M["Read manifest, operation ID and target state"]
M --> C{"Output already committed?"}
C -- "Yes" --> V["Reconcile and finish publication metadata"]
C -- "No" --> I{"Required input and state retained?"}
I -- "Yes" --> R["Resume or replay into an isolated candidate"]
I -- "No" --> S["Restore or resnapshot with a new change cursor"]
R --> T["Validate keys, totals, revisions and coverage"]
S --> T
T --> P["Publish candidate and retire superseded output safely"]
V --> P
{% endcapture %}
{% capture fallback_2 %}
Inspect durable run and sink state. Reconcile a committed output; otherwise resume from retained input or restore/resnapshot. Validate the candidate before publication.
{% endcapture %}
{% include diagram.html title="Recover from durable evidence before deciding what to repeat" code=diagram_2 fallback=fallback_2 caption=true %}


When the target and progress record share a transaction, commit them together. Across independent systems, use commit markers, stable operations and reconciliation. A source-to-log checkpoint and a warehouse publication checkpoint describe different stages and should remain distinct.

## Plan a backfill as a controlled release

Define the affected interval and dependency closure first. Correcting one day of input can change a seven-day rolling feature for later dates. A backdated dimension correction can require fact rekeying. The repair range includes that dependency closure.

Pin code, schema, reference data and source snapshots. Schedule bounded intervals and reserve capacity for live processing. Prevent a backfill for revision 8 from replacing live revision 9 through version checks, disjoint output namespaces or controlled partition ownership.

Build candidate outputs, reconcile by partition and business key, and promote a verified set. Record the publication version and which downstream reports or features require refresh. Replaying a workflow must not resend old emails, repeat charges or trigger other business actions unintentionally.

Airflow's documented backfill controls include reprocessing behavior, run order and concurrency. Those controls schedule work; the application still owns idempotent writes and input semantics. Command syntax differs by Airflow release, so use the installed release's documentation.

## Source retention bounds recoverability

A stored offset cannot recover a log segment that has expired. Monitor the oldest recoverable source position against consumer lag and outage duration. Retain immutable raw data or a supported snapshot strategy when the required replay horizon exceeds broker or source-log retention. A fresh snapshot can reconstruct current state but cannot recreate intermediate historical events that no retained source contains. Record such gaps explicitly rather than claiming a lossless replay.

Change-data-capture (CDC) snapshot/bootstrap must cover concurrent writes using the connector's documented handoff. Reading tables first and starting a change feed later can miss changes in between. Restoring a table and then continuing from an unrelated offset can produce the same gap.

Lakehouse cleanup and object retention must preserve the files and metadata needed by active readers and repairs. Recovering that version requires its referenced data files as well as metadata.

## Recovery objectives need measured drills

**Recovery point objective (RPO)** is the accepted data-loss window. **Recovery time objective (RTO)** is the accepted time to restore the promised service. Restored infrastructure can still leave data freshness outside its contract.

At 100,000 arriving events/second, a ten-minute outage creates 60 million events. Recovery capacity of 160,000/second drains that backlog in about 16.7 minutes while new events continue arriving. Include startup, restore, validation and publication time in the full RTO.

Test failure before a sink commit, after commit but before progress recording, during publication, after lease expiry and after source-history expiration. Record recovered coverage and duplicate counts. A recovery procedure is credible when another operator can execute it from the retained metadata.

[Capacity estimates]({{ '/data-engineering/foundations/capacity-estimation/' | relative_url }}) derives catch-up rate. [Incident diagnosis]({{ '/data-engineering/reliability/diagnosis-symptoms-evidence/' | relative_url }}) narrows the failure before repair.
