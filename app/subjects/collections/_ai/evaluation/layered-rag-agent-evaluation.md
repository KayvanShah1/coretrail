---
title: "Evaluate retrieval, generation and agent execution separately"
description: "Locate failures using retrieval metrics, groundedness checks, trajectories, and release gates."
chapter: evaluation
order: 1
sequence: 801
level: Core
keywords:
  - Evaluate retrieval, generation and agent execution separately
interview_queries:
  - explain evaluate retrieval, generation and agent execution separately
---

A single end-to-end score rarely explains where a retrieval-augmented generation (RAG) workflow failed. A document parser can lose a table; embedding retrieval can miss the correct section; a reranker can demote it; or the model can ignore a correct passage. Separate evaluation by layer.

## A dataset that can reveal failures

Use representative questions, expected evidence and permitted actions, including ambiguous cases, outdated documents, missing-answer cases, authorization checks and multi-step tasks. Version the source corpus, parsers, chunkers, embedding model, search configuration, reranker and generator.

## Retrieval metrics

Recall@k measures how many relevant documents appear in the top k. Precision@k measures the relevant fraction in that set. Mean reciprocal rank (MRR) rewards the position of the first relevant result. Normalized discounted cumulative gain (nDCG) accounts for rank and graded relevance.

A high Recall@20 does not imply good context quality if the reranker produces weak top-five passages. Measure each retrieval stage separately.

## Answer checks

Evaluate citation support and groundedness, completeness of the required facts, explicit abstention where evidence is missing, and leakage of restricted information. Check that answers do not borrow contradictory text from unrelated documents. Human review remains useful for disputed or high-stakes cases.

## Agent trajectories

Test tool selection, parameter correctness, step ordering, policy gates, retry behavior, task completion and final hard-constraint satisfaction. Record failure cases as regression examples. A tool call that retrieves the correct record with the wrong authorization scope is a failure even if the final answer looks correct.

## Latency and cost

Separate retrieval p95, reranking time, queueing, model time to first token, decode latency, tool calls and any speech synthesis cost. Aggregate pass rates can hide concentration of failures on specific aliases, long conversations or rare tool results.

A release gate should combine quality thresholds with behavioral constraints, cost budgets, and a representative end-to-end run. Offline metrics diagnose the cause; traces and production feedback reveal regressions after deployment.
