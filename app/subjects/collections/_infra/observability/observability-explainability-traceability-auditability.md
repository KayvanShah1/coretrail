---
title: "Observability, explainability, traceability and auditability"
nav_title: "Evidence across data and AI systems"
description: "Distinguish runtime diagnosis, decision explanations, provenance and reviewable action records across pipelines, model services and agents."
chapter: observability
order: 2
sequence: 402
level: Core
keywords: [observability, explainability, traceability, auditability, OETA, lineage, provenance, SHAP, audit log, correlation ID, model governance]
interview_queries: [observability vs traceability vs auditability, how do you explain a model prediction, what evidence should an agent retain, how do you audit a data pipeline]
last_verified: "2026-10-25"
references:
  - title: OpenTelemetry observability primer
    url: https://opentelemetry.io/docs/concepts/observability-primer/
  - title: W3C provenance overview
    url: https://www.w3.org/TR/prov-overview/
  - title: OpenLineage object model
    url: https://openlineage.io/docs/spec/object-model/
  - title: NIST four principles of explainable AI
    url: https://nvlpubs.nist.gov/nistpubs/ir/2021/NIST.IR.8312.pdf
  - title: scikit-learn permutation importance
    url: https://scikit-learn.org/stable/modules/permutation_importance.html
  - title: A unified approach to interpreting model predictions
    url: https://papers.nips.cc/paper/7062-a-unified-approach-to-interpreting-model-predictions
---

A service can have healthy latency while returning the wrong prediction. A trace can show every network hop while omitting the model version. An explanation can sound reasonable while having no support in the calculation that produced the result. These are different evidence problems.

## Four questions, four responsibilities

| Property | Question it answers | Evidence it needs |
|---|---|---|
| Observability | What is the running system doing, and where did behavior change? | Correlated metrics, logs, traces, quality signals and deployment state |
| Explainability | What factors or rules account for this result, and what are its limits? | Appropriate model/rule explanations, assumptions, supporting evidence and audience context |
| Traceability | Which inputs, versions and processing steps produced this output? | Stable identities and provenance across datasets, runs, releases and requests |
| Auditability | Can an independent reviewer reconstruct who did what, under which authority, and with what outcome? | Retained action/approval records, provenance, access controls and evidence of integrity |

The four properties can be remembered as **OETA**. Each needs its own evidence contract. A telemetry backend can support them but cannot automatically establish all four.

## Follow the same output across DE, ML and AI

| Workload | Observability | Explainability | Traceability | Auditability |
|---|---|---|---|---|
| Data engineering (DE): revised revenue table | Freshness, rejects, count changes, duration and failing stage | A changed currency rule accounts for the revised amount | Input snapshot, code version, dimension version, run and output commit | Publisher identity, approved rule change, checks and retained publication record |
| Machine learning (ML): fraud decision | Feature age, score/error distributions and request latency | Local feature contributions plus threshold/policy reason | Prediction ID, feature snapshot, preprocessing, model and threshold versions | Decision time, release approval, access record, override and eventual outcome |
| AI agent: creates a support refund | Tool timeouts, loop count, task success and cost | Policy rule and verified order facts supporting the permitted refund | Task/trace IDs, prompt/model/tool versions, retrieved evidence and tool result | Acting identity, authorization, approval if required, idempotency key and confirmed effect |

For the refund, a fluent final message is weak evidence. The business system's refund ID and amount establish the effect. If the tool times out after committing, record an uncertain outcome and reconcile using the operation identity before retrying. See [typed tools and execution state]({{ '/ai-engineering/agents/typed-tools-execution-state/' | relative_url }}).

## Explanations must match their purpose

**Global explanations** describe overall model behavior. Permutation importance measures how a selected evaluation metric changes when a feature is disrupted; correlated features can share or hide predictive information. **Local explanations**, including SHapley Additive exPlanations (SHAP) feature attributions, allocate a particular prediction relative to a chosen background or reference. The reference, feature dependence and model/explainer assumptions affect the interpretation.

A large contribution does not establish that changing that feature will cause the desired real-world outcome. An attribution describes the fitted model under its assumptions. A business decision may additionally depend on a threshold, policy rule or human override, so retain those components alongside model evidence.

For a deterministic transformation, an explanation can identify the rule and input rows that changed the aggregate. For a retrieval-augmented generation (RAG) answer, retain accessible source revisions and verify that the cited evidence supports the claims. A generated rationale is not a faithful execution record. Application-level decisions, evidence and tool outcomes provide inspectable records without requiring private chain-of-thought text.

The National Institute of Standards and Technology (NIST) frames explanation around providing reasons, making them meaningful to the audience, reflecting the actual process and recognizing knowledge limits. A feature plot suitable for a model engineer may need a different presentation for an operations reviewer.

## Join records through stable identities

A trace follows runtime work; lineage follows derivation. They can be linked through `run_id`, `prediction_id`, `release_id` or an agent task ID. A network trace saying “read table” provides little reproducibility if the table has since changed. Record the input version or a durable snapshot reference. W3C provenance models entities, activities and responsible agents; OpenLineage applies job/run/dataset concepts to data processing.

A useful decision record includes event time and recording time, actor/service identity, correlation IDs, resolved release versions, input/evidence references, policy result, action identity, output reference, status and error/override reason. Restrict or redact sensitive payloads; a stable identifier plus a protected retained artifact can be more appropriate than copying raw inputs into every log.

## Retention and integrity change the design

Metrics usually aggregate and traces may be sampled. Rare authorization decisions, model promotions and committed external actions need a retention policy designed for review even when their request trace was not sampled. Store high-cardinality request IDs in logs/traces or decision records rather than creating a metric time series for every ID.

Protect retained records from unauthorized edits, record access, define retention/deletion behavior and make gaps visible. Append-only or write-once storage and signed manifests can strengthen integrity, but completeness and correct identity remain application responsibilities. A hash without protected provenance does not prove that the original event was captured truthfully.

Recording an intended action before a remote call leaves a crash window before its outcome is known. Persist the action identity, reconcile the external result and record the final state. An audit log alone cannot guarantee exactly-once effects.

Versioned artifacts make reconstruction possible. Exact numerical reproduction can still depend on nondeterministic kernels, runtime versions or provider behavior. State whether a review reproduces exact bytes, equivalent predictions or the recorded original outcome.

Use [metrics, logs and traces]({{ '/infrastructure/observability/metrics-logs-traces/' | relative_url }}) for telemetry mechanics, [pipeline metadata and lineage]({{ '/data-engineering/reliability/metadata-lineage-tools/' | relative_url }}) for dataset evidence, and [model lifecycle records]({{ '/ml/operations/model-lifecycle-monitoring/' | relative_url }}) for experiment-to-release provenance.
