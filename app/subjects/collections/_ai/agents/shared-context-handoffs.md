---
block_diagrams: true
title: "Shared agent context, handoffs and durable artifacts"
description: "Organize conversation history, workflow checkpoints and evidence artifacts for concurrent agents without leaking permissions or losing revisions."
chapter: agents
order: 3
sequence: 703
level: Intermediate
keywords: [multi agent shared state, context window, supervisor, artifact store, handoff, checkpoint, concurrency]
aliases: [shared agent context, agent memory, context engineering]
interview_queries: [how do agents share context, how does a multi agent handoff work]
references:
  - title: LangGraph persistence
    url: https://docs.langchain.com/oss/python/langgraph/persistence
---
A task that passes through a research agent, analysis agent and report agent needs a durable place for results. Copying every conversation and tool result into each model call increases token use, obscures provenance and allows stale summaries to replace verified evidence.

## Five stores with different lifetimes

| Context | Contents | Lifetime and owner |
|---|---|---|
| Request | Identity, tenant, constraints, task ID | Request-scoped, trusted backend |
| Conversation | Messages and conversational continuity | Session / checkpointer |
| Workflow | Current step, approvals, attempts and completion status | Durable orchestrator state |
| Memory | Reusable information across sessions | Long-term store with user and policy scope |
| Evidence | Documents, source spans, validated outputs | Versioned artifact/document store |

A model context window is reconstructed from these stores when a model call occurs. The authoritative record remains outside the model. A summary preserves conversational continuity. Verified amounts, permissions, operation status and citations remain in typed records with their own versions, so summarization cannot change the authoritative values.

{% include block-diagram.html id="shared-agent-context" %}

## Passing a task contract

A handoff can contain a task ID, sender and recipient, target objective, permitted artifact references, expected result schema and state version. The recipient retrieves only authorized evidence, validates inputs, writes its result and reports completion. Large documents stay in storage; their identifiers travel between agents.

```json
{
  "task_id": "assessment-42",
  "from": "research",
  "to": "analysis",
  "artifacts": ["evidence-set-v7"],
  "objective": "Compute exposure from cited policy values",
  "expected_schema": "risk-assessment-v2",
  "state_version": 9
}
```

The result can be independently tested for cited values and calculation correctness. Sending only a prose summary loses the connection to the underlying documents.

### A version conflict in practice

Suppose research and analysis both read workflow state version 9. Research writes a new evidence artifact and advances the state to 10. An analysis result based on version 9 now needs validation against the changed evidence. A compare-and-swap write requiring version 9 fails, exposing the conflict before a stale result replaces current work.

The controller can rerun analysis against the new artifact or accept independent fields through a defined merge rule. Appending two result artifacts is usually easier to reconcile than allowing both agents to replace one shared summary. Reducers need deliberate ordering and duplicate-handling rules; concatenating every retry can repeat the same result.

## Concurrent agents and failed handoffs

Two agents writing the same state field can overwrite one another. Give them separate output artifacts where possible, then reconcile updates using version checks, reducers with defined semantics or database transactions. The orchestration layer owns transitions; tool services continue to enforce authorization at execution time.

A worker may crash after an external payment succeeds but before recording its completion. Checkpoint restoration alone can retry the action. Persist operation IDs and use idempotent tools or reconciliation against the external service.

## Keeping context current

Long-running tasks should either pin a consistent knowledge-index release or explicitly permit refresh between steps. If a policy changes after research but before reporting, combining evidence from unrelated revisions can create contradictory conclusions.

Token budgets should be spent on task-relevant passages, structured constraints and necessary tool results. Retrieve older conversation or artifacts on demand. Evaluate context selection by whether required facts reach the model and whether stale or unauthorized passages are excluded.

For tool authorization and execution budgets, see [typed tools and execution state]({{ '/ai-engineering/agents/typed-tools-execution-state/' | relative_url }}). For source-version publication, see [incremental indexing]({{ '/ai-engineering/retrieval/document-chunks-incremental-updates/' | relative_url }}).
