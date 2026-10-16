---
title: "AI evaluation"
nav_title: Overview
description: "Build reference datasets and diagnose retrieval, context selection, generation and tool execution independently."
chapter: evaluation
order: 0
sequence: 800
level: Chapter overview
---
A successful answer can conceal unsafe tool activity, while a failed answer can arise from lost source evidence or an incorrect final calculation. Evaluation needs reference cases, component-level diagnostics and complete execution trajectories.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/ai-engineering/evaluation/layered-rag-agent-evaluation/' | relative_url }}">Evaluate retrieval, generation and agent execution separately</a><span>Trace parsing, search, context, answer and agent failures.</span></li>
<li><a href="{{ '/ai-engineering/evaluation/golden-datasets-contamination/' | relative_url }}">Golden datasets, hard negatives and contamination</a><span>Create representative cases and preserve independent holdouts.</span></li>
<li><a href="{{ '/ai-engineering/evaluation/metrics-release-gates/' | relative_url }}">Metrics and release gates</a><span>Measure retrieval, groundedness, tool completion, latency and cost at their failure stages.</span></li>
<li><a href="{{ '/ai-engineering/evaluation/evidence-survival-oracle-tests/' | relative_url }}">Evidence survival, oracle tests and stage-level diagnostics</a><span>Find where required facts disappear and isolate retrieval from generation limitations.</span></li>
</ul>
