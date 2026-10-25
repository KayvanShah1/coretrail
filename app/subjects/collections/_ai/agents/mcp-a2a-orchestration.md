---
title: "MCP, A2A and agent orchestration"
description: "Follow tool integration and remote-agent tasks through discovery, delegation, progress, recovery and authorization."
chapter: agents
order: 2
sequence: 702
level: Core
mermaid: true
keywords: [Model Context Protocol, MCP, Agent2Agent, A2A, LangGraph, Google ADK]
interview_queries: [MCP vs A2A, what does an MCP server expose, why use multi-agent orchestration]
references:
  - title: Model Context Protocol architecture
    url: https://modelcontextprotocol.io/docs/learn/architecture
  - title: A2A protocol specification
    url: https://a2a-protocol.org/latest/specification/
  - title: LangGraph persistence
    url: https://docs.langchain.com/oss/python/langgraph/persistence
---

A tool-using agent already interacts with application code, model endpoints and business services. Protocols become relevant when other applications need a consistent way to discover capabilities or delegate work.

## Model Context Protocol (MCP)

An MCP **host** runs the AI application. It creates MCP clients that connect to MCP servers exposing tools, resources and reusable prompts. Tools describe executable operations and input schemas; resources expose context. Servers frequently wrap existing APIs or databases.

{% capture diagram_code %}
flowchart LR
A["AI application / host"] --> B["MCP client"]
B <-->|"Tool / resource requests"| C["MCP server"]
C --> D["Existing API / database"]
A <-->|"Task delegation"| E["Other agent via A2A"]
{% endcapture %}
{% capture diagram_fallback %}
AI host → MCP client ↔ MCP server → APIs and databases. Separately, the host may delegate a task to another agent using A2A.
{% endcapture %}
{% include diagram.html title="Tool integration and agent delegation" code=diagram_code fallback=diagram_fallback caption=true %}

MCP uses structured messages and can communicate over standard input/output or Streamable HTTP. An exposed query tool must still validate inputs, enforce user permissions and restrict the operations it performs. Discovering a tool does not grant unrestricted authority.

## Agent2Agent (A2A)

A2A supports communication between agents. Agent Cards advertise skills and endpoints; tasks, messages, artifacts and lifecycle states allow one agent to follow work delegated to another.

For a procurement workflow, an agent can delegate tax analysis to a finance agent. The finance agent may internally call accounting tools through MCP, while the caller receives the result and task status. These protocols can coexist because they connect different participants.

### A remote task has an observable lifecycle

The caller discovers an Agent Card, selects an advertised skill and authenticates to the remote endpoint. It sends the objective with the allowed evidence references and retains the returned task ID when the server creates a tracked task. Simple interactions can return a message directly.

{% capture task_diagram %}
flowchart TD
C["Discover capability and authenticate"] --> S["Send task and retain remote task ID"]
S --> W["Remote agent working"]
W --> I{"More input or authorization needed?"}
I -- "Yes" --> U["Obtain permitted input or credentials"]
U --> W
I -- "No" --> V{"Result available?"}
V -- "Completed" --> A["Read and validate artifacts"]
V -- "Failed / rejected / canceled" --> F["Record outcome and choose recovery"]
W -. "Caller connection lost" .-> R["Reconnect using known task ID"]
R --> W
{% endcapture %}
{% capture task_fallback %}
Discover and authenticate, send the task and retain its ID, then follow progress. Input or authorization may interrupt work. Completion returns artifacts for validation; failed, rejected or canceled work needs an explicit recovery decision. Reconnect to known work after a connection loss.
{% endcapture %}
{% include diagram.html title="A2A task progress and recovery" code=task_diagram fallback=task_fallback caption=true %}

**Submitted** and **working** describe progress. **Input required** and **authorization required** describe interruptions that need a response. **Completed**, **failed**, **rejected** and **canceled** are terminal outcomes. These are conceptual labels; enum spelling and transport methods depend on the protocol version supported by both endpoints.

Polling can retrieve the known task's status. Streaming provides updates while connected, and supported push notifications can report asynchronous progress. The Agent Card advertises supported capabilities. A dropped connection leaves completion uncertain: retrieve or subscribe to the existing task before submitting replacement work.

If the first submission times out before the caller receives a task ID, recovery needs an application correlation record or a server-supported duplicate-submission mechanism. A fresh request can otherwise create a second task. Cancellation also needs confirmation; an already committed external action may require reconciliation or compensation.

### Task, context, message and artifact identity

| Identifier or output | Purpose |
|---|---|
| Task ID | Follow one remote unit of work and its lifecycle |
| Context ID | Group related interactions where supported |
| Message ID | Identify an exchanged message |
| Artifact | Deliver a result, structured data or a file reference |

A shared context identifier associates work; it gives no automatic access to another agent's private messages, model state or storage. The receiving service checks the caller's identity and the permitted artifact scope. Credentials should travel through supported authentication mechanisms, not through a model-generated prose handoff.

## Orchestration is application responsibility

Frameworks such as LangGraph and Google Agent Development Kit (ADK) provide primitives to build workflows, tool calls and session handling. LangGraph checkpoints can preserve the current graph state across interrupted execution; longer-term stores have different lifetimes.

A checkpoint may show an external tool call as unfinished even after the external service succeeded. If a worker crashes before writing the result, a resumed run could repeat the action. The external service needs a stable idempotency key, reconciliation or equivalent deduplication.

Persist a run identifier, authorized tool list, validated arguments, attempt state and completed results. Set bounded time, step and cost budgets. Treat tool results and retrieved documents as untrusted content that must not override authorization.

## When does multi-agent help?

Distinct permissions, independently owned specializations or parallel subtasks can justify delegation. A single controller with typed tools is often sufficient for structured search and state updates. Measure the change in task success, latency, token usage and handoff errors before splitting work across agents.

For execution controls, continue with [typed tools and durable state]({{ '/ai-engineering/agents/typed-tools-execution-state/' | relative_url }}).
