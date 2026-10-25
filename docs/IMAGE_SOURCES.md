# Figures, native diagrams and source references

Verified October 25, 2026. CoreTrail uses ten source-backed HTML diagrams and four unchanged official images. Schemas remain Mermaid ER diagrams. Slowly changing dimension examples use native tables with a shared customer change and explicit reporting results.

## Match the handbook

Native diagrams use the handbook’s DM Sans typography, theme variables, green accents and rounded panels. Their text remains selectable and wraps at the reading size. Responsive grids preserve independent inputs and branches. Connectors attach to the actual rendered boxes and redraw when panels resize. Control and recovery routes use dashed lines.

Use `block-diagram.html` with `app/_data/block_diagrams.json`; set `block_diagrams: true` on the lesson. A figure’s caption explains its reading order and the decision it supports. The Parquet diagram uses nested HTML regions for row groups, column chunks and pages, with a concrete projection/pruning example.

SCD examples use accessible tables so the customer identity, change date, version keys and historical/current reporting agree throughout the example.

## Native diagram references

| Diagram                  | Technical reference                                                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| warehouse-methods        | [Kimball Group](https://www.kimballgroup.com/data-warehouse-business-intelligence-resources/kimball-techniques/dimensional-modeling-techniques/enterprise-data-warehouse-bus-architecture/) |
| shared-agent-context     | [LangGraph persistence](https://docs.langchain.com/oss/python/langgraph/persistence)                                                                                                        |
| medallion-models         | [Databricks data warehousing architecture](https://docs.databricks.com/gcp/en/sql/get-started/data-warehousing-concepts)                                                                    |
| delta-platform           | [Delta Lake concurrency control](https://docs.delta.io/concurrency-control/)                                                                                                                |
| distributed-query-stages | [Google Cloud BigQuery query plan explanation](https://docs.cloud.google.com/bigquery/docs/query-plan-explanation)                                                                          |
| prefill-decode-pools     | [vLLM disaggregated prefill documentation](https://docs.vllm.ai/en/latest/features/disagg_prefill.html)                                                                                     |
| lambda                   | [Microsoft](https://learn.microsoft.com/en-us/azure/architecture/databases/guide/big-data-architectures)                                                                                    |
| kappa                    | [Microsoft](https://learn.microsoft.com/en-us/azure/architecture/databases/guide/big-data-architectures)                                                                                    |
| rag-architecture         | [Microsoft](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/rag/rag-solution-design-and-evaluation-guide)                                                                  |
| parquet-layout           | [Apache Software Foundation](https://parquet.apache.org/docs/file-format/)                                                                                                                  |

Original HTML diagrams and examples are repository-authored explanatory material. They do not reproduce the linked source artwork.

## Unchanged official images

Images retain their source colors and bytes in both site themes. Keep them under `app/assets/img/site/<subject>/<chapter>/<topic>/`; `app/_data/figures.json` records dimensions, captions, alt text, source URLs, reuse terms and SHA-256 checksums. Readers can enlarge to native width or open the original.

| Figure                | Source                                                                             | License                                                   |
| --------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------- |
| kubernetes-components | [The Kubernetes Authors](https://kubernetes.io/docs/concepts/overview/components/) | [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) |
| iceberg-metadata      | [Apache Software Foundation](https://iceberg.apache.org/spec/)                     | [Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0) |
| query-stages          | [Google](https://docs.cloud.google.com/bigquery/docs/query-plan-explanation?hl=en) | [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) |
| partition-cluster     | [Google](https://docs.cloud.google.com/bigquery/docs/clustered-tables)             | [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) |

Source copyright, license and notice files remain under `app/assets/img/site/licenses/`.

## Verification

Static checks validate image integrity, diagram references, unique layout cells and valid connector endpoints. Browser checks cover desktop, phone and narrow tablet layouts, node clipping, connector crossings, theme changes, image loading and enlargement. SCD checks verify the worked version rows and fact-key assignments. Screenshots support the visual review; these checks do not establish full accessibility conformance.
