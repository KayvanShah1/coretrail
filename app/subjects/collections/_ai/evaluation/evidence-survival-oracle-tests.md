---
title: "Evidence survival, oracle tests and stage-level diagnostics"
description: "Trace relevant facts from source extraction through reranking and generation to isolate a failing RAG component."
chapter: evaluation
order: 4
sequence: 804
level: Intermediate
math: true
keywords: [oracle retrieval, evidence survival, layer wise evaluation, RAG debugging, context sufficiency]
aliases: [layer by layer RAG evaluation, oracle context experiment]
interview_queries: [where did the correct evidence disappear, how to identify a RAG bottleneck]
---
End-to-end answer accuracy indicates whether users received the right result. It cannot explain whether the document was absent, parsing lost a table, approximate search skipped a neighbor, reranking dropped the source or generation ignored correct context. Stage-level evaluation follows the same labeled evidence through each step.

## Keep traceable references across stages

Every evaluation case should identify the source revision, relevant document/section spans, required facts, query type and valid output. Chunk IDs alone are fragile when experimenting with chunking strategies. Map source evidence spans to the chunks created by each candidate system.

| Stage | Evidence to inspect | Diagnostic |
|---|---|---|
| Source and parser | Correct fields, tables, code and section relationships | Extraction completeness, table fidelity |
| Chunker | Required facts still co-located or recoverable | Evidence coverage, split boundaries |
| ANN retrieval | Known neighbors compared with exact search | Approximate-index recall |
| Lexical/vector candidates | Ground-truth passages returned | Recall@k, first-hit rank, nDCG |
| Reranker | Relevant passages retained | Conditional evidence survival |
| Context packing | Every required fact reaches final prompt | Sufficient-evidence coverage, token utilization |
| Generator | Claims grounded in supplied passages | Correctness, faithfulness, supported citations |
| Agent | Tools and effects consistent with task contract | Task success, policy violations, recovery |

For example, among 200 questions the correct source might exist in 194, initial search find it for 176, reranking retain it for 164, context packing include it for 157 and generation answer correctly for 139. These hypothetical counts describe a *query-level survival funnel*, not Precision@k. A query needing three facts only survives a stage when all required evidence remains accessible.

{% include math.html tex="\operatorname{RerankSurvival}=\frac{\text{queries retaining sufficient evidence}}{\text{queries with sufficient evidence before reranking}}" block=true %}

The denominator matters. Comparing 164/200 with 164/176 answers different questions; the latter isolates loss conditional on successful candidate retrieval.

## Oracle substitution reveals where improvement is possible

Replace one stage's output with verified material while holding downstream configuration as fixed as possible.

- **Oracle retrieval:** Supply human-verified relevant documents. A large answer-quality increase implicates missing or poorly selected evidence upstream.
- **Oracle context:** Supply only validated facts and sections. A further improvement suggests extraction/context formatting burdens the generator.
- **Oracle tool output:** Supply expected structured tool results. If an agent now succeeds, inspect tool selection, argument generation and dependency behavior.

Oracle experiments expose the headroom for improvement; they do not prove a single component is causally responsible when replacing it also changes prompt length, evidence ordering or other conditions.

## Watch the multi-hop failure

A question comparing two regulations needs passages from both years. A reranker can improve mean reciprocal rank (MRR) by bringing one excellent 2026 passage to first place while excluding the only 2025 passage. Track full evidence coverage in addition to ranking scores.

For numerical questions, evaluate the underlying source value and the final calculation independently. For no-answer queries, success may require abstention. For restricted evidence, unauthorized retrieval is a failure even if the final sentence happens to be true.

## Distinguish quality from operational health

Trace identifiers connect parser version, corpus snapshot, retriever, reranker, prompt, generator and tool executions to the resulting answer. A stable p95 latency alongside falling correctness suggests content or model quality changes; rising queue latency with stable quality points elsewhere.

Turn observed failures into regression fixtures while preserving an independent test set. See [golden datasets and contamination]({{ '/ai-engineering/evaluation/golden-datasets-contamination/' | relative_url }}) and [retrieval ranking metrics]({{ '/ai-engineering/retrieval/vector-search-ranking/' | relative_url }}).
