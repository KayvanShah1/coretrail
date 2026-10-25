---
title: "Prompt releases, context budgets and application caching"
description: "Version the AI application around the model, budget its context and distinguish prefix reuse from cached answers and retrieved evidence."
chapter: production
order: 9
sequence: 409
level: Core
keywords: [prompt versioning, context engineering, context window, prompt cache, prefix caching, response caching, semantic cache, cache invalidation, AI release manifest]
interview_queries: [what should be versioned in an AI application, prompt caching vs response caching, how do you manage context limits, when is semantic caching unsafe]
last_verified: "2026-10-25"
references:
  - title: vLLM automatic prefix caching
    url: https://docs.vllm.ai/en/stable/features/automatic_prefix_caching/
  - title: Claude prompt caching
    url: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
  - title: LangGraph persistence
    url: https://docs.langchain.com/oss/python/langgraph/persistence
---

An unchanged model can behave differently after a prompt edit, a new tool schema, a changed document index or an altered conversation summary. Deploying an AI application therefore requires a release identity broader than the model checkpoint.

## Version the application contract

A release manifest can bind the model/provider revision, prompt template, generation settings, tokenizer/chat template where controlled, output schema, retrieval/index configuration, tool schemas, policy version and orchestration code. Record the resolved release for each request and every fallback path.

**Example:** release `a17` uses prompt `p8`, generator `g4`, index `i21`, reranker `r3` and tool contract `t5`. If `a18` changes only `p8` to `p9`, the comparison should hold the other components constant. If a managed provider cannot pin an exact backend revision, record the available deployment identifier and observation time, retain evaluation evidence, and account for that uncertainty during diagnosis.

Treat prompt changes as releases: run held-out task and adversarial evaluations, review behavioral differences, then shadow or canary before broader promotion. A prompt that improves average answer quality can still violate a tool policy or remove an important abstention behavior. [Release gates]({{ '/ai-engineering/evaluation/metrics-release-gates/' | relative_url }}) own those checks.

## Allocate a context budget deliberately

The model's context limit is shared by instructions, tool definitions, conversation history, retrieved evidence, tool results and the tokens reserved for output, with details depending on the serving API. Count the actual serialized request. Character counts and word counts are unreliable substitutes for tokenizer counts.

For an **illustrative 32,000-token limit**, reserving 4,000 output tokens leaves at most 28,000 input tokens. Instructions and tools using 4,000 plus retained history using 6,000 leave 18,000 for evidence and other inputs before an operating margin. A valid request can still be expensive or lose salient evidence inside a long context.

Select evidence against the current information need, preserve source identity, and keep decisive constraints available. Summaries reduce size but can omit exact identifiers or earlier commitments; retain durable structured state for those facts. Untrusted retrieved text remains data and does not gain instruction authority because it was included in context. See [shared context and handoffs]({{ '/ai-engineering/agents/shared-context-handoffs/' | relative_url }}) and [trust boundaries]({{ '/ai-engineering/agents/trust-policy-boundaries/' | relative_url }}).

## Cache the correct thing

| Cache | What it reuses | Key and invalidation concerns |
|---|---|---|
| Prefix / prompt cache | Previously computed state for an identical supported prefix | Model/runtime, exact serialized prefix and isolation rules; changes can remove hits |
| Exact response cache | A completed answer for an equivalent request contract | Prompt/model release, inputs, permissions, evidence freshness and generation settings |
| Semantic response cache | An answer to a sufficiently similar earlier query | Similarity is only a candidate match; intent, entities, time and permissions must also agree |
| Retrieval / embedding cache | Search candidates or vector computations | Embedding/index version, filters, source revision, normalization and permissions |

Prefix caching can reduce repeated prefill work; it does not reuse the completed answer or eliminate output-token decoding. Putting stable instructions before variable content can improve reuse where the engine/provider supports that prefix structure. Provider rules, cache lifetimes and pricing differ, so use measured hit rates and the deployed service's documentation.

An answer cache changes the application's result path. “Can order 123 be refunded?” and “Can order 124 be refunded?” may be semantically close while requiring different decisions. Mutable inventory, balances, permission checks and side effects need fresh validation. Cache a safe intermediate result or read-only response only when the full validity contract can be checked.

## Invalidation follows dependencies and authorization

An answer depends on its evidence and release. If document revision `d7` is replaced by `d8`, either invalidate dependent entries or make revision/knowledge-epoch identity part of lookup. Time to live (TTL) bounds staleness; it does not prove freshness at request time.

Scope caches by the authorization context required by the data, and recheck access before returning sensitive cached content. A permissions change may invalidate an otherwise identical query. Log hit/miss, entry age and resolved dependencies so reviewers can distinguish a live model response from a reused answer.

Measure saved work and task success as well as hit rate. A cache that makes stale answers fast can improve latency while reducing correctness. [Index migrations and cache invalidation]({{ '/ai-engineering/retrieval/embedding-index-migrations/' | relative_url }}) owns embedding/index compatibility; [evidence traceability]({{ '/infrastructure/observability/observability-explainability-traceability-auditability/' | relative_url }}) connects the cached result to its origin.
