---
title: "Shared agent context, handoffs and durable artifacts"
description: "Organize conversation history, workflow checkpoints and evidence artifacts for concurrent agents without leaking permissions or losing revisions."
chapter: agents
order: 3
sequence: 703
level: Intermediate
mermaid: true
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

A model context window is reconstructed from these stores when a model call occurs. The authoritative record remains outside the model. A summary can preserve conversational continuity, but must not silently overwrite verified amounts, permissions, executed actions or source citations.

{% capture diagram_code %}
flowchart TD
A["User and request identity"] --> B["Supervisor / workflow controller"]
B --> C["Research agent"]
B --> D["Analysis agent"]
B --> E["Report agent"]
C --> F["Shared artifact and checkpoint stores"]
D --> F
E --> F
F --> G["Versioned evidence / DB / retrieval"]
{% endcapture %}
{% capture diagram_fallback %}
User request → supervisor → research, analysis and report agents. Agents read permitted versioned artifacts and write results/checkpoints to a shared store. The controller manages task transitions.
{% endcapture %}
{% include diagram.html title="Structured handoffs backed by durable artifacts" code=diagram_code fallback=diagram_fallback caption=true %}

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

## Concurrent agents and failed handoffs

Two agents writing the same state field can overwrite one another. Give them separate output artifacts where possible, then reconcile updates using version checks, reducers with defined semantics or database transactions. The orchestration layer owns transitions; tool services continue to enforce authorization at execution time.

A worker may crash after an external payment succeeds but before recording its completion. Checkpoint restoration alone can retry the action. Persist operation IDs and use idempotent tools or reconciliation against the external service.

## Keeping context current

Long-running tasks should either pin a consistent knowledge-index release or explicitly permit refresh between steps. If a policy changes after research but before reporting, combining evidence from unrelated revisions can create contradictory conclusions.

Token budgets should be spent on task-relevant passages, structured constraints and necessary tool results. Retrieve older conversation or artifacts on demand. Evaluate context selection by whether required facts reach the model and whether stale or unauthorized passages are excluded.

For tool authorization and execution budgets, see [typed tools and execution state]({{ '/ai-engineering/agents/typed-tools-execution-state/' | relative_url }}). For source-version publication, see [incremental indexing]({{ '/ai-engineering/retrieval/document-chunks-incremental-updates/' | relative_url }}).
