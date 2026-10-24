---
title: "Metrics and release gates for RAG and agents"
description: "Choose retrieval, generation, tool, latency and cost metrics that identify the failing component."
chapter: evaluation
order: 3
sequence: 803
level: Core
math: true
keywords: [Recall@k, MRR, nDCG, agent success, p95, cost per successful task]
interview_queries: [which metrics should an AI agent track, how do you evaluate RAG relevance, when should you alert or retrain]
---

A retrieval-augmented generation (RAG) answer can be wrong because parsing lost a table, retrieval missed a passage, context assembly discarded it, or generation ignored it. Operational metrics may remain healthy throughout. Record where the failure occurred.

## Retrieval metrics in the release decision

Use the [retrieval metrics reference]({{ '/ai-engineering/retrieval/vector-search-ranking/' | relative_url }}) for Precision@k, Recall@k, mean reciprocal rank (MRR) and normalized discounted cumulative gain (nDCG), including formulas and worked rankings.

Set gates for the stage that feeds the consumer. Candidate recall can remain healthy while reranking or context selection discards required evidence. Compare overall scores and important slices, including missing-answer cases and restricted documents, against the same held-out corpus.

## Generation and tool execution

Measure answer correctness, completeness, supported citations, correct abstention and permission compliance. Citation presence alone does not prove the citation supports a claim.

For agent workflows, evaluate the tool choice, input arguments, ordering, loops, retries, final state and task completion. A coherent final sentence can mask a tool call that failed or created the wrong side effect. Treat unauthorized disclosure and duplicate financial actions as high-severity failures with their own release thresholds.

## Production quality, latency and economics

| Signal | Where it points |
|---|---|
| Retrieval p95 and zero-hit rate | Index, filters, source update, query mix |
| Time to first token (TTFT) | Queueing, prefill, model load |
| Inter-token latency | Decode throughput and serving pressure |
| Tool timeout rate and step count | Dependency failure or agent loop |
| Key-value (KV) cache use, waiting requests | Graphics processing unit (GPU) concurrency and memory |
| Cost per successful task | Total service spend relative to actual completed work |

{% include math.html tex="\operatorname{CostPerSuccess}=\frac{\operatorname{TotalSpend}}{\operatorname{SuccessfulTasks}}" block=true %}

Include failed attempts in total spend. Report the accounting period, task definition and whether audio or external API costs are included. Compare per-tenant and per-task distributions; an overall average can hide expensive long conversations.

## What runs when?

Golden datasets and adversarial tests run before release. Shadow traffic checks the candidate against production-shaped inputs without affecting user actions. A canary exposes a controlled group to the new version while comparing success, latency and errors against the existing service.

Alert immediately for infrastructure outages, authorization violations, missing critical features or error-rate breaches. Retraining is a candidate response to verified predictive degradation; it cannot repair a broken embedding index, a bad tool contract or missing source documents.

A successful rollout needs explicit quality, safety, latency and cost gates. See [large language model (LLM) serving metrics]({{ '/ai-engineering/observability/metrics/' | relative_url }}) for inference-side diagnostics.
