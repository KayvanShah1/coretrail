---
title: "Pipeline metadata, lineage and tracking tools"
description: "Separate execution control, dataset identity, lineage and observability, then choose the smallest toolset that answers recovery and ownership questions."
chapter: "reliability"
order: 6
sequence: 706
level: "Core"
mermaid: true
keywords: ["metadata","lineage","OpenLineage","OpenMetadata","DataHub","dbt artifacts","run manifest","schema registry","catalog","OpenTelemetry"]
interview_queries: ["OpenLineage vs data catalog","what metadata tools help pipeline recovery"]
last_verified: "2026-10-25"
references: [{"title":"OpenLineage object model","url":"https://openlineage.io/docs/spec/object-model/"},{"title":"OpenMetadata standards","url":"https://docs.open-metadata.org/latest/main-concepts/metadata-standard"},{"title":"DataHub official project","url":"https://github.com/datahub-project/datahub"},{"title":"dbt manifest artifact","url":"https://docs.getdbt.com/reference/artifacts/manifest-json"},{"title":"dbt run-results artifact","url":"https://docs.getdbt.com/reference/artifacts/run-results-json"},{"title":"OpenTelemetry signals","url":"https://opentelemetry.io/docs/signals/"},{"title":"Confluent schema compatibility","url":"https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html"}]
---

Revenue changes after a rerun. Explaining the change requires the input revision, transformation code, dimension versions, output snapshot and validation results for both releases.

## Track several kinds of metadata

| Kind | Example | Why it matters |
|---|---|---|
| Technical | Columns, types, partitions and table format | Interpret data and plan compatible changes |
| Business | Owner, grain, units, metric definition and allowed use | Prevent incompatible joins and measures |
| Operational | Run/attempt IDs, intervals, counts, progress and failures | Resume, diagnose and reconcile work |
| Lineage | Which input versions produced an output | Trace impact and reproduce a result |
| Quality | Failed keys, checks, distributions and freshness | Establish whether output is fit for use |
| Governance | Classification, access rules, retention and deletion | Control use and lifecycle obligations |

A catalog describes data. An operational control record coordinates execution. The control record must have the consistency needed for ownership and checkpoint changes; asynchronous catalog ingestion should not decide whether a payment or batch may execute again.

## A minimal run and dataset record

Record stable dataset identifiers, logical intervals, source positions, source manifest, code/configuration release, schema version, output snapshot, read/write counts, rejected counts, reconciliation results, status timestamps and owner. Add parent/child run links for distributed work.

Source namespace and tenant belong in identity where needed. A table called `customers` in two environments is not one dataset. A file path alone may also be reused for different bytes, so retain object versions or content fingerprints.

Large payloads and rejected records can stay in controlled object storage with references in the metadata store. Avoid copying sensitive rows, credentials or entire model prompts into a broadly visible catalog.


{% capture diagram_1 %}
flowchart TD
J["Extractor and transformation jobs"] --> C["Transactional run and checkpoint records"]
J --> A["Versioned input/output manifests"]
J --> L["Lineage events and quality results"]
L --> B["Catalog or lineage backend"]
C --> O["Recovery operator"]
A --> O
B --> U["Discovery and impact analysis"]
J --> T["Metrics, logs and traces"]
T --> O
{% endcapture %}
{% capture fallback_1 %}
Jobs write durable control records and versioned manifests for recovery, emit lineage and quality metadata for discovery, and produce operational telemetry for diagnosis.
{% endcapture %}
{% include diagram.html title="Durable control state and searchable lineage have different consumers" code=diagram_1 fallback=fallback_1 caption=true %}


## Match the tool to the missing evidence

| Need | Tools or mechanism to evaluate | What remains application responsibility |
|---|---|---|
| Consistent leases, progress and publication | PostgreSQL or another suitable transactional control store | State transitions, fencing, retention and reconciliation |
| Dataset dependencies and run events | OpenLineage producers plus a supported receiving backend | Instrumentation coverage and stable identity |
| Discoverable ownership, glossary and lineage | OpenMetadata or DataHub | Accurate ingestion, access policy and owner maintenance |
| SQL-model graph and execution evidence | dbt artifacts and tests | Retaining artifacts per release and resolving external dependencies |
| Scheduled/asset execution | Airflow or Dagster | Source/sink correctness and idempotent effects |
| Producer/consumer schema compatibility | A schema registry with compatible clients | Semantic mappings, rollout and invalid-record handling |
| Request or job-stage telemetry | OpenTelemetry and monitoring backends | Instrumentation, sampling and alert definitions |

OpenLineage's model distinguishes jobs, their runs and datasets, with extensible facets for additional metadata. Its producers emit metadata to a compatible backend. Application checkpoints remain in the execution system's durable store.

dbt's `manifest.json` describes project nodes and dependencies. `run_results.json` records invocation results associated with resource IDs. Preserve both, along with code revision and relevant catalog/freshness artifacts, because the latest files can overwrite evidence from an earlier run. Artifact schemas are versioned.

A schema registry checks supported structural compatibility rules. It cannot determine whether a renamed monetary field changed from rupees to paise. A catalog's lineage can also be incomplete when dynamic SQL, manual copies or unsupported connectors bypass capture. Show coverage and provenance instead of presenting inferred edges as certain.

## Choosing metadata tools

For one pipeline, a transactional run table, immutable manifests and retained dbt/orchestrator artifacts may suffice. Add a shared catalog when discovering owners and tracing dependencies across teams becomes expensive. Add runtime lineage when static project dependencies omit actual inputs or outputs.

Before adopting a platform, test connector support for the deployed versions, incremental metadata updates, deletion behavior, authentication, sensitive-data exposure and how quickly a failed ingestion becomes visible. A feature listed in a product overview does not establish coverage of a particular source or custom job.

## Tracing a changed output release

Given a bad output snapshot, identify its producing run, input versions, code and downstream consumers. Compare that manifest with the last verified release. Inspect row rejections, source coverage and changed rules, then plan a bounded rebuild and track its publication.

Lineage identifies possible impact; validation establishes actual impact. A downstream model may depend on a table but only read unaffected partitions. Preserve enough interval-level information to avoid rebuilding the entire platform unnecessarily.

[Pipeline fundamentals]({{ '/data-engineering/foundations/pipeline-run-lifecycle/' | relative_url }}) defines the execution records. [Recovery and backfills]({{ '/data-engineering/reliability/recovery-replay-backfills/' | relative_url }}) uses them to reconstruct data.

For the distinction between runtime diagnosis, explanations, provenance and reviewable action records, use [observability, explainability, traceability and auditability]({{ '/infrastructure/observability/observability-explainability-traceability-auditability/' | relative_url }}).
