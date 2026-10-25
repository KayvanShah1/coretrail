---
title: "Delta Lake, Iceberg and Hudi: selection and operations"
description: "Compare table protocols, update costs, engine compatibility, retention and the evidence needed before choosing a lakehouse format."
chapter: "storage"
order: 2
sequence: 302
level: "Core"
mermaid: true
keywords: ["Delta Lake","Iceberg","Hudi","transaction log","copy on write","merge on read","compaction","vacuum","schema evolution","lakehouse selection"]
interview_queries: ["Delta Lake vs Iceberg vs Hudi","why lakehouse merges and vacuum cause problems"]
last_verified: "2026-10-25"
references: [{"title":"Delta Lake concurrency control","url":"https://docs.delta.io/concurrency-control/"},{"title":"Delta Lake feature compatibility","url":"https://docs.delta.io/versioning/"},{"title":"Delta Lake retention and utilities","url":"https://docs.delta.io/delta-utility/"},{"title":"Iceberg reliability","url":"https://iceberg.apache.org/docs/latest/reliability/"},{"title":"Iceberg maintenance","url":"https://iceberg.apache.org/docs/latest/maintenance/"},{"title":"Hudi table and query types","url":"https://hudi.apache.org/docs/table_types/"}]
---

A folder of Parquet files can hold analytical data, but concurrent updates and consistent reads require a publication protocol. Delta Lake, Apache Iceberg and Apache Hudi add table metadata and change-management behavior around data files. Delta Lake is a table-storage project; Databricks is a broader platform that supports it.

## Table versions and commit visibility

Delta readers reconstruct a table version from its transaction log and checkpoints. A writer stages changes, validates conflicts against the version it read, and commits a new version if validation succeeds. Abandoned files can exist without belonging to a committed table version.

Iceberg tracks table snapshots through metadata and manifests, with commits coordinated through the catalog's supported mechanism. Readers follow the selected snapshot instead of treating every object in a directory as live data.

Hudi tracks changes through its timeline and file groups. Table type and query type determine whether readers combine base files with more recent logged changes. All three need compatible engines, storage configuration and maintenance.


{% capture diagram_1 %}
flowchart TD
S["Read current table version"] --> W["Prepare new data and metadata"]
W --> V{"Commit assumptions still valid?"}
V -- "Yes" --> C["Commit next table version"]
V -- "Conflict" --> R["Re-read and retry or fail safely"]
R --> S
C --> Q["Readers resolve a consistent snapshot"]
W -. "Uncommitted files" .-> O["Retention-aware orphan cleanup"]
{% endcapture %}
{% capture fallback_1 %}
Writers prepare data and validate commit assumptions. A successful table commit publishes a consistent version. Conflicts require a valid retry; uncommitted files need safe cleanup.
{% endcapture %}
{% include diagram.html title="Prepared files become visible through a committed table version" code=diagram_1 fallback=fallback_1 caption=true %}


The exact isolation, retry behavior and supported operations depend on the engine, connector, catalog and enabled table features. Check that combination before enabling a new feature for a table shared by several engines.

{% include figure.html id="iceberg-metadata" %}

## Selection starts with workload and interoperability

| Candidate | Investigate when | Validate on the actual stack |
|---|---|---|
| Delta Lake | Delta-aware engines and merge/streaming workflows fit the team | Protocol features, reader/writer support, concurrent mutations and retention |
| Iceberg | Multiple analytical engines and evolving partition layouts matter | Catalog behavior, engine write/delete support and snapshot maintenance |
| Hudi | Frequent keyed changes and incremental consumption are central | Record keys, ordering/merger behavior, query type, compaction and concurrency mode |
| Plain versioned Parquet datasets | Append/batch outputs have simple single-writer publication | Manifest completeness, replacement strategy and safe cleanup |
| Managed warehouse tables | SQL analytics and managed operations dominate | Load/update economics, workload queues, quotas and export needs |
| Transactional application database | Low-latency entity operations and relational constraints dominate | Locking, indexes, write amplification and replica lag |

Evaluate these starting points with the supported release and the complete read/write workflow.

## Copy-on-write versus merge-on-read

In a copy-on-write design, updating a few records can rewrite affected base files. Readers then have a simpler scan, while writers pay amplification. In merge-on-read designs, changes can be recorded separately and combined during reads or later compaction. This moves work between write, read and maintenance paths.

Hudi explicitly exposes Copy-on-Write and Merge-on-Read table types. For a Merge-on-Read table, a read-optimized query over base files can lag recent logged changes, while a supported snapshot query merges them. Verify query type before diagnosing “missing” updates.

Other formats and runtimes implement updates differently. Execution plans and table metadata reveal which files are read or rewritten.

## Maintenance is part of the design

Small batches can create many tiny files, increasing planning and object requests. Compact them using a supported table operation so metadata remains consistent. Select partitioning/clustering from filter patterns and update locality; a partition per customer can produce excessive metadata and hot-write problems.

Retention must exceed the recovery needs of active readers, streams and backfills. Delta time travel requires retained log and data files. Vacuuming old data files can make older versions unreadable even while their metadata still exists. Iceberg snapshot expiration and orphan cleanup likewise need coordination with readers and retained references.

A source deletion, table tombstone, expired snapshot and legally deleted object are different states. Follow the applicable deletion policy across caches, derived tables, archives and backups.

## Symptoms and targeted fixes

| Symptom | Evidence | Candidate repair |
|---|---|---|
| Concurrent mutation failures | Overlapping predicates, metadata changes, commit conflicts | Serialize conflicting work or use disjoint supported write scopes |
| Reads miss recent Hudi updates | Table/query type and compaction progress | Use the intended snapshot query or repair maintenance lag |
| Planning is slow before compute starts | File count, manifests, partition metadata | Compact files and maintain metadata with supported procedures |
| Merge scans or rewrites too much | Matched-key distribution and bytes touched | Narrow valid predicates, improve layout and batch related changes |
| Time travel fails | Missing data files, retained log/snapshots, cleanup history | Recover from retained copies or rebuild; metadata alone is insufficient |
| A second engine cannot read the table | Connector version and enabled features | Upgrade compatibility or publish a supported projection |

## Capacity is an engine-and-workload result

Throughput depends on the engine, layout and workload using the table protocol. A large append-only table and a smaller table receiving many scattered updates stress different paths. Measure ingest and update rate, file count, query concurrency, bytes scanned, commit latency and maintenance backlog.

A 1 TB logical update batch can cause much more physical I/O if it touches records spread across many files. Include rewrite amplification and temporary file space in the [capacity calculation]({{ '/data-engineering/foundations/capacity-estimation/' | relative_url }}), then run representative concurrent reads, writes and recovery.
