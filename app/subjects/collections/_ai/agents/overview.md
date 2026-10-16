---
title: "Agents & tool execution"
nav_title: Overview
description: "Design typed tool contracts, durable execution, shared context and controlled multi-agent handoffs."
chapter: agents
order: 0
sequence: 700
level: Chapter overview
---
An agent's model may select actions, but the application owns state persistence, authorization and the execution record. Single- and multi-agent architectures share these operational requirements. Parallel specialists introduce another problem: deciding which context and artifacts each participant should receive.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/ai-engineering/agents/typed-tools-execution-state/' | relative_url }}">Tool-using agents, state and guardrails</a><span>Validate arguments, persist steps and prevent unsafe duplicate effects.</span></li>
<li><a href="{{ '/ai-engineering/agents/mcp-a2a-orchestration/' | relative_url }}">MCP, A2A and agent orchestration</a><span>Separate tool integration, delegation and durable workflow execution.</span></li>
<li><a href="{{ '/ai-engineering/agents/shared-context-handoffs/' | relative_url }}">Shared agent context, handoffs and durable artifacts</a><span>Share versioned evidence and structured state without duplicating entire conversations.</span></li>
</ul>
