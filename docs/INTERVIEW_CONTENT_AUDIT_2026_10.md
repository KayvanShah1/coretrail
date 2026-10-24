# October 2026 interview-content audit

This pass compares PR #6 with the retrieved October interview-revision discussion and the 50-page **Production AI Engineering Interview Handbook** dated October 16, 2026. Conversation retrieval supplied topic and example summaries; the handbook supplied the detailed study material. Personal project drills and interview-positioning text stay outside the published lessons.

## Coverage and repairs

| Material                     | Location in CoreTrail                                                            | Result of this pass                                                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| End-to-end RAG               | AI → Retrieval → From source documents to grounded answers                       | Added asynchronous indexing / online answering diagram and a worked traffic estimate                                        |
| Chunk revisions and deletion | AI → Retrieval → Document chunking, revisions and incremental indexing           | Retained the existing branching lifecycle; reviewed overlap, manifests, publication and authorization behavior              |
| HNSW, IVF, hybrid ranking    | AI → Retrieval → Vector indexes, ranking and retrieval metrics                   | Added filtered-search diagram, inverted-index explanation, index-versus-relevance recall example and threshold caveat       |
| Ten-million-chunk migration  | AI → Retrieval → Embedding versions, index migration and cache invalidation      | Added snapshot cursor, restartable backfill, concurrent changes, tombstones, encoder/index routing and usable rollback      |
| Agent protocols              | AI → Agents → MCP, A2A and agent orchestration                                   | Added task lifecycle/recovery diagram, identity distinctions and reconnect-versus-resubmit behavior                         |
| Shared agent context         | AI → Agents → Shared agent context, handoffs and durable artifacts               | Corrected artifact/checkpoint ownership in the diagram and added a concrete version conflict                                |
| Stage-level evaluation       | AI → Evaluation → Evidence survival, oracle tests and stage-level diagnostics    | Added the missing query-survival diagram with explicit loss counts and recovery-path qualification                          |
| NLP foundations              | AI → Inference → NLP preprocessing, representations and entity resolution        | New topic: normalization, stemming, lemmatization, sparse representations, pooling, NER and entity linking                  |
| Classical ML baselines       | ML → Fundamentals → Linear models, PCA and clustering baselines                  | New topic: fitting objectives, scale, regularization, PCA, K-means, DBSCAN and validation                                   |
| Neural training              | ML → Fundamentals → Neural-network optimization and architecture choices         | Expanded activations and clarified L1/L2 regularization versus weight decay                                                 |
| Feature availability         | ML → Features → Point-in-time joins and availability leakage                     | Restricted the observed-event cutoff to historical observations; explained future-known forecast issue/target times         |
| Forecast metrics             | ML → Fundamentals → Regression and time-series forecasting evaluation            | Clarified the sign convention for forecast bias                                                                             |
| GCP service selection        | Infrastructure → Cloud → GCP service choices, execution limits and failure cases | New topic: events versus commands, orchestration, deadlines, durable jobs, processing/storage choices and downstream quotas |
| Pub/Sub interview follow-ups | DE → Reliability → Streaming acknowledgments, retries and replay safety          | Added deadline/lease/retention/dead-letter distinctions and corrected acknowledgment/checkpoint implications                |
| Spark aggregate then window  | DE → Processing → Spark SQL plans, partitioning, AQE and skew                    | Added SQL/DataFrame equivalents, volatility definition, ties, nulls, minimum observations, grain and variance merging       |

Existing lessons also cover model comparisons, precision/recall/AUC, feature stores, structured and multimodal documents, GraphRAG, agent safety, inference, container startup, GPU placement and operational monitoring. These remain within their owning chapters; cross-links connect related concepts.

## Editorial decisions

Reviewed the PR's added lessons and their adjacent explanations for causal wording, ambiguous terms, acronym expansion, duplication and incomplete examples. Expanded domain-specific abbreviations where missing. Replaced several repeated contrast constructions and imperative warnings with mechanisms and consequences.

The NLP, cloud and classical-baseline topics have direct links from their chapter overviews. Each new topic carries search metadata and primary references. Vendor limits are dated and scoped to the service or trigger that imposes them. Numerical capacity, retrieval and migration examples are explicitly illustrative.

## Verification

The repository's content checks validate front matter, unique ordering, internal routes and chapter membership. The existing test suite checks search behavior and SQL results. The new stock-ranking example is also checked locally on a small PostgreSQL fixture with tied winners, nulls, one-observation groups and an excluded date; this validates the SQL result semantics, not a distributed Spark runtime.

The render matrix now includes the new NLP, GCP and classical-baseline pages, the end-to-end RAG map and the evidence-survival map. Existing agent, ranking and migration routes check all diagrams on each page at desktop and mobile sizes.

A model-lifecycle diagram was missing its renderer flag; that flag is restored and the page is covered by rendered checks. The content validator now rejects diagram/math includes whose renderer is disabled. Bare inline LaTeX is converted to the supported math component. Screenshot review also exposed tiny mobile labels on complex graphs. The shared diagram component now preserves a minimum label scale, adds a scrolling hint and exposes a keyboard-focusable scroll region. Render checks verify scale and exercise horizontal keyboard scrolling. Formatting of the render verifier is repaired, and the CI format check is required. GitHub Actions builds Jekyll, runs warehouse-plan tests, checks discovery and captures rendered diagrams/equations. Local Docker verification depends on access to the Docker engine; a source check alone cannot establish rendered correctness.
