---
title: "Data lake and Delta Lake design: when a warehouse is needed"
description: "Assign raw retention, table commits, analytical serving and operational reads to the right components."
chapter: architecture
order: 3
sequence: 178
level: Core
mermaid: true
last_verified: "2026-10-25"
keywords: [data lake design, Delta Lake design, data warehouse, lakehouse, catalog, external tables, analytical serving]
interview_queries: [when do I need a data warehouse, how would you design a Delta Lake platform]
references:
  - title: Delta Lake concurrency control
    url: https://docs.delta.io/concurrency-control/
  - title: Delta Lake storage configuration
    url: https://docs.delta.io/delta-storage/
  - title: BigQuery external table limitations
    url: https://docs.cloud.google.com/bigquery/docs/external-tables
  - title: Databricks medallion architecture
    url: https://docs.databricks.com/gcp/en/lakehouse/medallion
---

A lake retains source and derived data in object storage. A usable analytical platform also needs named datasets, schemas, access control, compute and a publication process. Delta Lake supplies a table protocol over data files; the surrounding platform must supply those other responsibilities.

## Choose the serving requirement before the platform

A **data warehouse** integrates historical data for analytical queries and reporting. A managed warehouse product additionally supplies services such as query execution, workload management and access controls. A lakehouse can provide warehouse capabilities over lake tables, so a separate managed copy is a workload decision.

| Requirement | Starting design | Evidence for adding or changing serving infrastructure |
|---|---|---|
| Retain source files for replay or occasional exploration | Object storage, manifests, catalog and an on-demand reader | Repeated queries need predictable performance or shared definitions |
| Governed SQL reports over stable facts and dimensions | Warehouse tables or lakehouse tables with a suitable SQL engine | Query concurrency, latency or operating effort misses the target |
| Frequent reports over the same expensive joins | Published marts or maintained aggregates | Recalculation costs more than maintaining the derived result |
| Low-latency entity reads and transactional updates | Operational database with appropriate indexes | Analytical scans interfere with transactions or require a separate projection |
| Training, large file transformations and varied formats | Lake storage plus compatible processing engines | Consumer-facing reporting needs a dedicated serving representation |

A warehouse becomes useful when teams repeatedly reconcile the same sources, require consistent metrics and history, or need analytical workloads isolated from application transactions. Even a modest dataset can justify it. A large archive queried once a month may be economical in object storage without another full copy.

A warehouse does not create correct identities, measures or history automatically. Those belong to [modelling and integration]({{ '/data-engineering/architecture/warehouse-integration-patterns/' | relative_url }}).

## A Delta Lake design with explicit publication

Consider device telemetry used for operational monitoring and settled monthly reporting. The following example uses micro-batches; a continuous processor could occupy the same transformation role.

{% capture lake_design %}
flowchart TD
S["Devices and source changes"] --> R["Immutable raw objects and input manifest"]
R --> T["Normalize, deduplicate and validate"]
T -- "Rejected records" --> Q["Quarantine with source position"]
Q -- "Approved repair" --> T
T -- "Accepted records" --> W["Delta-aware writer"]
W --> D["Curated Delta table: data files and log"]
C["Catalog, schema and access policies"] -. "Resolve and authorize" .-> D
D --> L["Lakehouse SQL engine"]
D --> P["Publish reconciled analytical marts"]
P --> W["Warehouse or lakehouse serving"]
L --> A["Exploration and training"]
W --> B["Reports at a declared freshness"]
{% endcapture %}
{% capture lake_fallback %}
Raw objects and input manifests support reconstruction. Validated records enter a Delta table through a compatible writer. Catalog policies govern access, while analytical consumers use a compatible SQL engine or published serving marts. Rejected records retain enough context for repair.
{% endcapture %}
{% include diagram.html title="Table commits sit inside a larger data platform" code=lake_design fallback=lake_fallback caption=true %}

| Component | Design decision |
|---|---|
| Raw landing area | Preserve source bytes, revision, arrival time and extraction coverage; restrict sensitive fields |
| Curated table | Declare row grain, source ordering, delete handling and schema compatibility |
| Catalog | Resolve table names and locations, track schemas and apply the platform's authorization rules |
| Compute | Choose engines whose readers and writers support the enabled Delta features |
| Publication | Reconcile the output and expose the accepted table version or multi-table release |
| Operations | Monitor lag, rejected records, commit failures, file growth and cleanup backlog |

In a conventional path-based Delta table, data files and the transaction log belong to one table root. The log records which files belong to a table version. Catalog-managed configurations can change commit coordination, so use the selected catalog and engine's supported write path. A catalog entry alone does not make an incompatible reader understand the table.

Raw source paths can organize extraction date and source revision. Curated table partitions answer query and maintenance needs. Applying the raw folder layout to every downstream table can create a poor analytical layout.

## Preserve time and correction semantics

Retain event time, source change position or version, and ingestion time when the source supplies them. A delayed reading and a correction to a previous reading need different interpretation. Define which source version wins for a key before applying an upsert.

Use a stable logical batch identifier and advance each stage's progress only after its durable output exists. The [pipeline lifecycle]({{ '/data-engineering/foundations/pipeline-run-lifecycle/' | relative_url }}) explains checkpoint and publication mechanics; [recovery and backfills]({{ '/data-engineering/reliability/recovery-replay-backfills/' | relative_url }}) works through reconstruction.

For related tables, consumers may need a release naming compatible versions rather than independently reading each table's latest version. Test concurrent reads during a correction and during maintenance, as well as normal ingestion.

## Query in place or load a warehouse copy?

External queries can avoid a duplicate storage copy and simplify occasional access. Their supported features, file discovery, pruning, metadata costs and performance depend on the service and connector. BigQuery documents limitations for external tables; native-table behavior cannot be assumed for every external source.

A serving copy can isolate reports from lake maintenance and give a predictable model to many users. It adds ingestion latency, duplicated storage and another correction path. Publish its source version and freshness so a report can be traced back to the lake.

Compare end-to-end cost: storage, repeated scans, compute, maintenance, data movement and operator time. Use [capacity estimates]({{ '/data-engineering/foundations/capacity-estimation/' | relative_url }}) and representative query concurrency. Then choose [physical layout]({{ '/data-engineering/storage/partitioning-file-sizing/' | relative_url }}) and [transformation tools]({{ '/data-engineering/orchestration/transformation-tool-selection/' | relative_url }}) for that workload.
