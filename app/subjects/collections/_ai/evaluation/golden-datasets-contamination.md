---
title: "Golden datasets, hard negatives and contamination"
description: "Design RAG and agent evaluation cases with explicit expected behavior, realistic failures, and independent holdouts."
chapter: evaluation
order: 2
sequence: 802
level: Core
keywords: [golden dataset, evaluation contamination, hard negatives, agent benchmark, held-out evaluation]
interview_queries: [how do you build an agent evaluation dataset, what are hard negatives, how do you avoid benchmark leakage]
---

An evaluation case should describe what success means before the system runs. A factual answer, a set of relevant documents, a valid tool trajectory, and a final state change have different correctness checks.

## Define the expected outcome

For retrieval-augmented generation (RAG), record the query, corpus version, relevant source identifiers, required facts and abstention behavior if the answer is absent. For an agent, add initial session state, allowed tools, user permissions, expected side effects and prohibited actions.

```json
{
  "case_id": "vehicle-budget-correction",
  "turns": [
    "Diesel truck below 12 lakh in Mumbai",
    "Raise the budget to 15 lakh; CNG is fine too"
  ],
  "expected": {
    "max_price": 1500000,
    "allowed_fuels": ["diesel", "cng"],
    "city": "Mumbai"
  },
  "invariant": "every returned vehicle meets active filters"
}
```

This example can be checked deterministically. For explanatory answers, a human-calibrated rubric might check required facts and whether each claim is supported by retrieved evidence.

## Sample real traffic and the cases it misses

Random samples reflect common requests, but severe failures may be rare. Include stratified cases for long conversations, aliases, ambiguous phrases, multi-hop evidence, out-of-date documents, restricted records and failed dependencies.

A **hard negative** is an incorrect candidate that closely resembles a relevant one. A vehicle document with the same model and location but a different registration or insurance date will test ranking more effectively than an unrelated paragraph. Inspect actual near-misses from the retriever and verify the labels.

{% include diagnostic-map.html id="evaluation-path" %}

## Contamination and evaluation overfitting

Documents copied across train and test, near-duplicate code tasks, or later versions of the same source can invalidate a split. Repeatedly changing the prompt against a fixed test set also makes it part of development.

Use source- or group-aware splits where duplication is plausible, and chronological splits for tasks where future information matters. Maintain a development set for iteration and a held-out set used sparingly for release decisions. Version the indexed corpus alongside the questions; later documents can make an earlier no-answer case answerable.

For coding agents, pin repository revisions, tests and dependencies. A code benchmark can be contaminated if an exact task or its reference patch appeared in model pretraining data, even without intentional leakage in your evaluation pipeline.

## Deterministic checks and judged outputs

Validate schemas, retrieved IDs, SQL results, authorization outcomes and final tool state using executable checks wherever possible. For open-ended prose, calibrate a model-based judge against human annotations, document disagreements and sample failures for review.

Turn newly observed failures into regression fixtures, but keep an independent holdout to show that a fix generalizes. A high overall pass rate can hide a small cohort with unacceptable privacy or transaction errors.

Next: [Metrics and release gates]({{ '/ai-engineering/evaluation/metrics-release-gates/' | relative_url }}).
