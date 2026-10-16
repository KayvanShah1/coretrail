---
title: "Choosing embeddings, rerankers and generation models"
description: "Compare retrieval quality, model behavior, latency and total cost with controlled paired experiments."
chapter: retrieval
order: 5
sequence: 605
level: Intermediate
math: true
keywords: [embedding benchmark, MTEB, cross encoder, model routing, RAG model selection, cost per successful task]
aliases: [which embedding model to use, embedding and LLM compatibility]
interview_queries: [can any embedding pair with any LLM, how to compare embedding models, why not choose largest LLM]
references:
  - title: Massive Text Embedding Benchmark
    url: https://github.com/embeddings-benchmark/mteb
---
An embedding encoder produces vectors for retrieval. A generation large language model (LLM) typically receives passages converted back to text. This means an encoder from one provider can support a generator from another. Query and document vectors, however, must belong to a mutually compatible embedding space. An identical vector dimension is insufficient.

The best individual encoder and best general-purpose generator need not produce the best application together. The generator may struggle with noisy context, dates, tables or ambiguous citations even when candidate retrieval improves.

## Hold the other components constant

Begin with one source snapshot, query set, parser, chunker, ranking configuration, prompt and generator. Compare candidate embedding models using labeled relevant passages. Measure Recall@k, mean reciprocal rank (MRR), normalized discounted cumulative gain (nDCG), latency and encoding throughput.

Next, hold candidate sets fixed while comparing cross-encoder rerankers. Evaluate whether relevant passages survive, including the multiple pieces of evidence required by complex questions.

For generation-model comparison, supply identical validated contexts to each LLM. Measure answer correctness against independent ground truth, citation support, abstention, schema compliance, latency and cost. Finally run a smaller set of promising **end-to-end combinations**, since effects interact.

| Stage | Freeze for a fair experiment | Primary outcomes |
|---|---|---|
| Encoder comparison | Corpus, chunking, search settings and labels | Retrieval recall, ranking, index cost |
| Reranker comparison | Initial candidates and queries | nDCG, sufficient evidence, latency |
| Generator comparison | Context, prompt and accepted outputs | Correctness, groundedness, completion |
| Whole-system comparison | Evaluation cohort and release assumptions | Quality, p95, policy, cost per success |

A public embedding leaderboard is a useful source of candidates. Its datasets may not represent domain terminology, multilingual queries, effective dates, tables or exact identifiers in the target product. Compare by query category as well as in aggregate.

## Quality is a constrained decision

{% include math.html tex="\max_{\theta}\ Q(\theta)\quad\text{subject to}\quad p95(\theta)\le L,\;C(\theta)\le B" block=true %}

Here `θ` represents encoder, chunking, reranker, generator and routing choices. `L` is a latency target and `B` a cost budget. Safety and permission requirements form additional hard constraints.

An illustrative comparison might find 0.91 Recall@10 at 65 ms and 0.92 at 110 ms with greater index memory. The second encoder is not automatically better. Inspect whether the quality difference is stable and whether the improvement reaches final answer correctness.

For task-level economics, count retries, fallback calls, tools and infrastructure:

{% include math.html tex="\operatorname{CostPerSuccess}=\frac{\operatorname{TotalCostOfAllAttempts}}{\operatorname{SuccessfulTasks}}" block=true %}

Paired evaluation runs the same cases through each candidate. Inspect case-level disagreements and uncertainty; a one-percentage-point difference on a hundred examples is not compelling evidence by itself.

## Routing different tasks

Structured lookups may use a smaller model, while complex evidence synthesis uses a more capable generator. Routing only helps when the classifier that assigns complexity works reliably. Incorrect routing can create costly retries or missed safety requirements. Measure task quality, escalation frequency and complete workflow cost.

The [index migration page]({{ '/ai-engineering/retrieval/embedding-index-migrations/' | relative_url }}) covers operational cutovers after a candidate wins. The [evidence evaluation page]({{ '/ai-engineering/evaluation/evidence-survival-oracle-tests/' | relative_url }}) shows how retrieval improvements translate into final answer quality.
