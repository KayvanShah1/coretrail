# Data modelling and pipeline source verification

Verified on **October 25, 2026**. Product behavior is grounded in official project/vendor documentation. Modelling methodologies use their original authors or organizations. Historical methodology publication dates are retained; they are not presented as recent product releases.

## Claims requiring particular care

| Claim                       | Scope and source                                                                                                                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SCD Types 4–7               | Uses [Kimball's published numbering](https://www.kimballgroup.com/2013/02/design-tip-152-slowly-changing-dimension-types-0-4-5-6-7/); other taxonomies can use Type 4 differently                            |
| Isolation                   | [PostgreSQL's documented behavior](https://www.postgresql.org/docs/current/transaction-iso.html), including its Repeatable Read and Serializable distinctions                                                |
| Lakehouse commits           | [Delta concurrency](https://docs.delta.io/concurrency-control/) and [Iceberg reliability](https://iceberg.apache.org/docs/latest/reliability/); scope is qualified by engine, catalog and supported features |
| Update/read trade-offs      | [Hudi table and query types](https://hudi.apache.org/docs/table_types/), including base-file read-optimized versus snapshot queries                                                                          |
| Retained versions           | [Delta utilities](https://docs.delta.io/delta-utility/) and [Iceberg maintenance](https://iceberg.apache.org/docs/latest/maintenance/); metadata cannot recover deleted data files                           |
| Hard limit example          | [PostgreSQL limits](https://www.postgresql.org/docs/current/limits.html): 32 TB per relation with the default 8 KB block size, not a throughput claim                                                        |
| Service concurrency example | [BigQuery quotas](https://docs.cloud.google.com/bigquery/quotas): two concurrent mutating DML statements per table under the documented queue rules; effective project/API quotas still need inspection      |
| Backfill controls           | [Current Airflow documentation](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/backfill.html); scheduling controls do not guarantee idempotent results                                  |
| Runtime lineage             | [OpenLineage object model](https://openlineage.io/docs/spec/object-model/) distinguishes job, run and dataset metadata from application checkpoints                                                          |

## Source inventory by topic

### [Data models, keys and relationship cardinality](../app/subjects/collections/_de/modelling/models-keys-relationships.md)

- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [MongoDB data modelling](https://www.mongodb.com/docs/manual/data-modeling/)
- [Apache Cassandra data modelling](https://cassandra.apache.org/doc/latest/cassandra/developing/data-modeling/index.html)

### [Dimensional modelling, star schemas and fact grain](../app/subjects/collections/_de/modelling/dimensional-facts-schemas.md)

- [Kimball dimensional modelling techniques](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/)
- [Microsoft star schema guidance](https://learn.microsoft.com/en-us/power-bi/guidance/star-schema)
- [Kimball enterprise bus matrix](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/enterprise-data-warehouse-bus-matrix/)

### [Slowly changing dimensions and temporal history](../app/subjects/collections/_de/modelling/scd-temporal-history.md)

- [Kimball SCD Types 0, 4, 5, 6 and 7](https://www.kimballgroup.com/2013/02/design-tip-152-slowly-changing-dimension-types-0-4-5-6-7/)
- [Kimball Type 2 dimension changes](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-2/)
- [dbt snapshot semantics](https://docs.getdbt.com/docs/build/snapshots)
- [Microsoft dimensional history guidance](https://learn.microsoft.com/en-us/power-bi/guidance/star-schema)

### [ACID, transactional workloads and cross-system consistency](../app/subjects/collections/_de/modelling/transactions-acid-consistency.md)

- [AWS ACID and BASE comparison](https://aws.amazon.com/compare/the-difference-between-acid-and-base-database/)
- [PostgreSQL transaction tutorial](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [PostgreSQL isolation semantics](https://www.postgresql.org/docs/current/transaction-iso.html)
- [PostgreSQL prepared transactions](https://www.postgresql.org/docs/current/sql-prepare-transaction.html)
- [Delta concurrency control](https://docs.delta.io/concurrency-control/)
- [Debezium outbox event router](https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html)

### [Kimball, Inmon, Data Vault and hybrid warehouse design](../app/subjects/collections/_de/architecture/warehouse-integration-patterns.md)

- [Kimball enterprise warehouse bus architecture](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/enterprise-data-warehouse-bus-architecture/)
- [Bill Inmon on the Corporate Information Factory](https://www.ewsolutions.com/evolution-corporate-information-factory/)
- [Data Vault Alliance introduction](https://datavaultalliance.com/engineering/data-vault-2-0-an-introduction/)
- [Data Mesh principles by Zhamak Dehghani](https://martinfowler.com/articles/data-mesh-principles.html)

### [Lambda, Kappa, medallion and hybrid processing](../app/subjects/collections/_de/architecture/lambda-kappa-medallion.md)

- [Jay Kreps: Questioning the Lambda Architecture](https://www.oreilly.com/radar/questioning-the-lambda-architecture/)
- [Databricks medallion architecture](https://docs.databricks.com/gcp/en/lakehouse/medallion)
- [Martin Fowler: Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Martin Fowler: CQRS](https://martinfowler.com/bliki/CQRS.html)
- [Apache Flink state evolution](https://nightlies.apache.org/flink/flink-docs-stable/docs/dev/datastream/fault-tolerance/serialization/schema_evolution/)

### [Delta Lake, Iceberg and Hudi: selection and operations](../app/subjects/collections/_de/storage/delta-iceberg-hudi-operations.md)

- [Delta Lake concurrency control](https://docs.delta.io/concurrency-control/)
- [Delta Lake feature compatibility](https://docs.delta.io/versioning/)
- [Delta Lake retention and utilities](https://docs.delta.io/delta-utility/)
- [Iceberg reliability](https://iceberg.apache.org/docs/latest/reliability/)
- [Iceberg maintenance](https://iceberg.apache.org/docs/latest/maintenance/)
- [Hudi table and query types](https://hudi.apache.org/docs/table_types/)

### [Data capacity and back-of-the-envelope calculations](../app/subjects/collections/_de/foundations/capacity-estimation.md)

- [PostgreSQL implementation limits](https://www.postgresql.org/docs/current/limits.html)
- [BigQuery quotas and limits](https://docs.cloud.google.com/bigquery/quotas)
- [Spark SQL performance tuning](https://spark.apache.org/docs/latest/sql-performance-tuning.html)
- [Flink state backends](https://nightlies.apache.org/flink/flink-docs-stable/docs/ops/state/state_backends/)

### [Pipeline fundamentals: contracts, checkpoints and publication](../app/subjects/collections/_de/foundations/pipeline-run-lifecycle.md)

- [Airflow best practices](https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html)
- [Apache Beam programming model](https://beam.apache.org/documentation/programming-guide/)
- [dbt model contracts](https://docs.getdbt.com/docs/mesh/govern/model-contracts)
- [OpenLineage object model](https://openlineage.io/docs/spec/object-model/)

### [Resumable pipelines, replay, backfills and safe recovery](../app/subjects/collections/_de/reliability/recovery-replay-backfills.md)

- [Airflow backfill controls](https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/backfill.html)
- [Debezium PostgreSQL snapshot and offset behavior](https://debezium.io/documentation/reference/stable/connectors/postgresql.html)
- [Flink checkpoints and recovery](https://nightlies.apache.org/flink/flink-docs-stable/docs/ops/state/checkpoints/)
- [Delta Lake retention requirements](https://docs.delta.io/delta-batch/)

### [Pipeline metadata, lineage and tracking tools](../app/subjects/collections/_de/reliability/metadata-lineage-tools.md)

- [OpenLineage object model](https://openlineage.io/docs/spec/object-model/)
- [OpenMetadata standards](https://docs.open-metadata.org/latest/main-concepts/metadata-standard)
- [DataHub official project](https://github.com/datahub-project/datahub)
- [dbt manifest artifact](https://docs.getdbt.com/reference/artifacts/manifest-json)
- [dbt run-results artifact](https://docs.getdbt.com/reference/artifacts/run-results-json)
- [OpenTelemetry signals](https://opentelemetry.io/docs/signals/)
- [Confluent schema compatibility](https://docs.confluent.io/platform/current/schema-registry/fundamentals/schema-evolution.html)

### [Diagnosing data failures from symptoms and evidence](../app/subjects/collections/_de/reliability/diagnosis-symptoms-evidence.md)

- [Spark SQL performance tuning](https://spark.apache.org/docs/latest/sql-performance-tuning.html)
- [BigQuery quota troubleshooting](https://docs.cloud.google.com/bigquery/docs/troubleshoot-quotas)
- [Delta concurrency conflicts](https://docs.delta.io/concurrency-control/)
- [PostgreSQL monitoring and locks](https://www.postgresql.org/docs/current/monitoring-stats.html)
- [Kimball Type 2 history](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/type-2/)

## Capacity and validation limits

Worked volumes, file counts, history growth, state estimates, scan envelopes and catch-up times are derived examples with explicit assumptions. They are not measured vendor throughput, prices or platform ceilings. Production sizing needs representative load, skew, concurrent reads/writes, maintenance and recovery tests.

SQL examples are checked locally on a PostgreSQL-compatible engine for row and time-boundary behavior. This does not establish multi-session concurrency, distributed transaction recovery or deployed lakehouse connector behavior. CI builds and renders the authored diagrams and equations on desktop and mobile.

## Lake design, layout and tool selection verification

Checked October 25, 2026. These references support the new workload-selection pages. Decision tables and numerical scenarios are reasoned examples with explicit assumptions; they are not benchmark results.

| Source                                                                                                         | Verified use                                                                         |
| -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [Delta best practices](https://docs.delta.io/best-practices/)                                                  | Conventional partition cardinality/volume guidance and supported compaction          |
| [Delta liquid clustering](https://docs.delta.io/delta-clustering/)                                             | Feature compatibility, clustering keys and incompatibility with partitioning/Z-order |
| [Databricks clustering](https://docs.databricks.com/aws/en/tables/clustering)                                  | Platform-specific recommendation and runtime qualification                           |
| [Delta storage configuration](https://docs.delta.io/delta-storage/)                                            | Supported storage/write coordination rather than generic object-directory writes     |
| [DuckDB file formats](https://duckdb.org/docs/2.0/guides/performance/file_formats)                             | Row-group parallelism, file-size trade-offs and selective scans                      |
| [DuckDB workload tuning](https://duckdb.org/docs/2.0/guides/performance/how_to_tune_workloads)                 | Larger-than-memory execution, blocking operators and spill constraints               |
| [Polars streaming](https://docs.pola.rs/user-guide/concepts/streaming/)                                        | Operator support, physical plan and in-memory fallbacks                              |
| [Spark EXPLAIN](https://spark.apache.org/docs/latest/sql-ref-syntax-qry-explain.html)                          | Logical/physical plan explanation modes                                              |
| [Spark SQL tuning](https://spark.apache.org/docs/latest/sql-performance-tuning.html)                           | Scan, statistics, join, shuffle and adaptive execution considerations                |
| [BigQuery partitioning](https://docs.cloud.google.com/bigquery/docs/partitioned-tables)                        | Engine-specific partition granularity and clustering guidance                        |
| [BigQuery external tables](https://docs.cloud.google.com/bigquery/docs/external-tables)                        | External-table capabilities and limitations depend on the source and connector       |
| [dbt introduction](https://docs.getdbt.com/docs/introduction)                                                  | Transformation-project scope; product/compute edition must be identified             |
| [Dataform overview](https://docs.cloud.google.com/dataform/docs/overview)                                      | Versioned SQL workflows executed in BigQuery                                         |
| [PostgreSQL index types](https://www.postgresql.org/docs/current/indexes-types.html)                           | Access-path selection for operational predicates                                     |
| [MongoDB modelling](https://www.mongodb.com/docs/manual/data-modeling/)                                        | Document representation follows access patterns and relationships                    |
| [Bigtable row keys](https://docs.cloud.google.com/bigtable/docs/schema-design)                                 | Lexicographic ranges, device/time keys and timestamp-leading hotspots                |
| [ClickHouse MergeTree](https://clickhouse.com/docs/reference/engines/table-engines/mergetree-family/mergetree) | Sorted parts, partitions and merge-related operating considerations                  |
| [Elasticsearch mappings and indexing](https://www.elastic.co/docs/solutions/search/get-started/index-basics)   | Search-oriented documents, mappings and indexes                                      |
| [Avro specification](https://avro.apache.org/docs/1.12.0/specification/)                                       | Schema-based row serialization and reader/writer resolution                          |
| [ORC specification](https://orc.apache.org/specification/ORCv1/)                                               | Columnar stripes, projection and statistics                                          |

Partition volume, target file size, row-group size, processing partition size and in-memory state are explicitly distinguished. No claim is made that choosing a named tool alone guarantees a particular data-volume ceiling.
