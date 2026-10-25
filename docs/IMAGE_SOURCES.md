# Image sources and reuse

Verified October 25, 2026. The site includes **10 unchanged official images** and **six original CoreTrail SVG illustrations**. Assets use app/assets/img/site/<subject>/<chapter>/<topic>/ and app/_data/figures.json owns their metadata. Schema diagrams use Mermaid ER syntax for tables, keys and cardinalities.

## Official images

Copyright remains with the credited author. Microsoft Fabric and Azure Architecture Center documentation, Google Cloud documentation and Kubernetes documentation use CC BY 4.0. Apache Parquet and Iceberg assets use Apache 2.0. License copies and the Iceberg notice are included under app/assets/img/site/licenses/. Original URLs, dimensions, retrieval dates and SHA-256 checksums are recorded in the registry. Official source images are reproduced unchanged.

License evidence:

- [Microsoft Fabric documentation](https://github.com/MicrosoftDocs/fabric-docs/blob/main/LICENSE)
- [Azure Architecture Center](https://github.com/MicrosoftDocs/architecture-center/blob/main/LICENSE)
- [Google Developers site policies](https://developers.google.com/site-policies)
- [Kubernetes website](https://github.com/kubernetes/website/blob/main/LICENSE)
- [Apache Parquet website](https://github.com/apache/parquet-site/blob/master/LICENSE)
- [Apache Iceberg](https://github.com/apache/iceberg/blob/main/LICENSE)

| Figure                   | Canonical asset                                                                                    | Author / reference                                                                                                                                                                          | Reuse                           |
| ------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| delta-platform           | /assets/img/site/data-engineering/architecture/lake-warehouse-design/delta-lake-platform.svg       | [Delta Lake concurrency control](https://docs.delta.io/concurrency-control/)                                                                                                                | Original CoreTrail illustration |
| distributed-query-stages | /assets/img/site/data-engineering/gcp/slots-shuffle-concurrency/distributed-query-stages.svg       | [Google Cloud BigQuery query plan explanation](https://docs.cloud.google.com/bigquery/docs/query-plan-explanation)                                                                          | Original CoreTrail illustration |
| iceberg-metadata         | /assets/img/site/data-engineering/storage/delta-iceberg-hudi-operations/iceberg-metadata.png       | [Apache Software Foundation](https://iceberg.apache.org/spec/)                                                                                                                              | Apache-2.0; unchanged           |
| kappa                    | /assets/img/site/data-engineering/architecture/lambda-kappa-medallion/kappa.png                    | [Microsoft](https://learn.microsoft.com/en-us/azure/architecture/databases/guide/big-data-architectures)                                                                                    | CC-BY-4.0; unchanged            |
| kubernetes-components    | /assets/img/site/infrastructure/kubernetes/pods-nodes-deployments/kubernetes-components.svg        | [The Kubernetes Authors](https://kubernetes.io/docs/concepts/overview/components/)                                                                                                          | CC-BY-4.0; unchanged            |
| lambda                   | /assets/img/site/data-engineering/architecture/lambda-kappa-medallion/lambda.png                   | [Microsoft](https://learn.microsoft.com/en-us/azure/architecture/databases/guide/big-data-architectures)                                                                                    | CC-BY-4.0; unchanged            |
| medallion-models         | /assets/img/site/data-engineering/architecture/lambda-kappa-medallion/medallion-models.svg         | [Databricks data warehousing architecture](https://docs.databricks.com/gcp/en/sql/get-started/data-warehousing-concepts)                                                                    | Original CoreTrail illustration |
| parquet-layout           | /assets/img/site/data-engineering/storage/partitioning-file-sizing/parquet-file-layout.gif         | [Apache Software Foundation](https://parquet.apache.org/docs/file-format/)                                                                                                                  | Apache-2.0; unchanged           |
| partition-cluster        | /assets/img/site/data-engineering/storage/partitioning-file-sizing/partitioning-and-clustering.png | [Google](https://docs.cloud.google.com/bigquery/docs/clustered-tables)                                                                                                                      | CC-BY-4.0; unchanged            |
| prefill-decode-pools     | /assets/img/site/ai-engineering/inference/efficient-inference/disaggregated-prefill-decode.svg     | [vLLM disaggregated prefill documentation](https://docs.vllm.ai/en/latest/features/disagg_prefill.html)                                                                                     | Original CoreTrail illustration |
| query-stages             | /assets/img/site/data-engineering/processing/query-plans-pruning/bigquery-query-stages.png         | [Google](https://docs.cloud.google.com/bigquery/docs/query-plan-explanation?hl=en)                                                                                                          | CC-BY-4.0; unchanged            |
| rag-architecture         | /assets/img/site/ai-engineering/retrieval/rag-search-at-scale/rag-architecture.svg                 | [Microsoft](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-solution-design-and-evaluation-guide)                                                                  | CC-BY-4.0; unchanged            |
| scd-type-1               | /assets/img/site/data-engineering/modelling/scd-temporal-history/scd-type-1.svg                    | [Microsoft](https://learn.microsoft.com/en-us/fabric/data-warehouse/dimensional-modeling-dimension-tables)                                                                                  | CC-BY-4.0; unchanged            |
| scd-type-2               | /assets/img/site/data-engineering/modelling/scd-temporal-history/scd-type-2.svg                    | [Microsoft](https://learn.microsoft.com/en-us/fabric/data-warehouse/dimensional-modeling-dimension-tables)                                                                                  | CC-BY-4.0; unchanged            |
| shared-agent-context     | /assets/img/site/ai-engineering/agents/shared-context-handoffs/shared-context-architecture.svg     | [LangGraph persistence](https://docs.langchain.com/oss/python/langgraph/persistence)                                                                                                        | Original CoreTrail illustration |
| warehouse-methods        | /assets/img/site/data-engineering/architecture/warehouse-integration-patterns/kimball-inmon.svg    | [Kimball Group](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/enterprise-data-warehouse-bus-architecture/) | Original CoreTrail illustration |

## Visual choices

- Mermaid ER diagrams own star, snowflake, conformed-dimension, bridge and Data Vault schemas. They expose table fields, keys and relationship cardinalities.
- Official SCD figures show before/after data changes; the process diagram separately explains validation and publication. The Type 2 caption distinguishes the source image date convention from the article's half-open interval example.
- Architecture illustrations show shared agent context, warehouse integration responsibilities, medallion responsibilities, a Delta Lake platform, distributed query stages and prefill/decode pools. They use fixed-size arrowheads, aligned spacing and opaque backgrounds.
- Lambda, Kappa, Parquet, Iceberg, BigQuery and Kubernetes use official images. Databricks artwork is not redistributed under its general site terms; the medallion figure is an original source-backed illustration.
- Static figures fit the column by default. Enlarge image enables keyboard scrolling; Open full size exposes the original file. Their colors remain unchanged between site themes.
- Descriptive text sketches have been replaced by figures, ordered steps, comparisons or prose. Real code and genuine query-plan output retain code formatting.

## Verification

The static checker validates figure references, asset paths, dimensions, credits, checksums, file signatures and SVG resources, and rejects arrow-only sketches in text code blocks. Browser checks cover schema rendering and relationship-label contrast, image overview visibility, enlargement, keyboard scrolling, full-size links, theme changes and page overflow at desktop/mobile widths.
