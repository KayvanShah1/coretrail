---
title: "Tool-using agents, state and guardrails"
description: "Reason about how an agent chooses tools, persists progress and recovers from a failed action."
chapter: agents
order: 1
sequence: 701
level: Core
keywords:
  - Tool-using agents, state and guardrails
interview_queries:
  - explain tool-using agents, state and guardrails
---

An agentic system adds a decision loop around model inference. The model can propose an action, but application code owns tool validation, authorization, execution, result capture and whether another step is permitted.

## Tool calling is an interface contract

A typed tool states what parameters are accepted, what each field means, and what its outputs signify. Server-side checks must reject invalid arguments, unauthorized operations and tool outputs that violate the data contract. Generated model text does not grant permissions.

For a vehicle-search workflow, the agent may retain budget, payload requirements, fuel type and city across turns. A corrected city or budget updates active search state. The search engine can perform parameterized queries and deterministic ranking, while the agent handles language and follow-up reasoning. Recheck final results against active hard constraints to guard against conversational drift.

## Persist execution state

Store stable run and step IDs, input constraints, selected tools, validated arguments, completed results, errors, authorization outcomes and pending external effects. After a restart, the controller must distinguish an unexecuted action from an action that succeeded before its acknowledgment was lost.

A payment collection workflow, for example, should enforce identity, policy gates and permitted tools before sending a payment action. An idempotency key prevents a retry from creating two payments.

## Single-agent or multi-agent?

Begin with a single controller and explicit tools when the workflow is clear. Separate specialized agents when tasks genuinely benefit from independent state, permissions or reasoning contexts. More agents introduce handoff errors, duplicated context, cost, latency and debugging complexity.

## Production controls

Cap tool depth, wall-clock duration and spending. Validate retrieved instructions as untrusted data; protect privileged tools from prompt injection. Require confirmation for irreversible actions, carry authorization context into tool execution, and trace every attempt and failure.

A plausible final answer does not establish successful agent execution. The trace must show which actions occurred and whether they respected the contract.
