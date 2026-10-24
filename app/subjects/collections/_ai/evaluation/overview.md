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

## Choose the test by the failure it can expose

| Test scope | Evidence it should retain | Detailed reference |
|---|---|---|
| Reference cases | Expected evidence, actions and held-out examples | [Golden datasets]({{ '/ai-engineering/evaluation/golden-datasets-contamination/' | relative_url }}) |
| Retrieval and context stages | Whether required facts survive each stage | [Evidence survival and oracle tests]({{ '/ai-engineering/evaluation/evidence-survival-oracle-tests/' | relative_url }}) |
| Tool execution | Arguments, authorization, effects and final state | [Agent trajectories]({{ '/ai-engineering/evaluation/agent-trajectories-judges/' | relative_url }}) |
| Release decision | Per-slice quality, latency, errors and task economics | [Metrics and release gates]({{ '/ai-engineering/evaluation/metrics-release-gates/' | relative_url }}) |

A component test isolates a fault; an end-to-end run checks whether the full workflow completes under the intended permissions. Version the source corpus and pipeline configuration so a changed score can be traced to a changed input or component.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/ai-engineering/evaluation/golden-datasets-contamination/' | relative_url }}">Golden datasets, hard negatives and contamination</a><span>Create representative cases and preserve independent holdouts.</span></li>
<li><a href="{{ '/ai-engineering/evaluation/metrics-release-gates/' | relative_url }}">Metrics and release gates</a><span>Measure retrieval, groundedness, tool completion, latency and cost at their failure stages.</span></li>
<li><a href="{{ '/ai-engineering/evaluation/evidence-survival-oracle-tests/' | relative_url }}">Evidence survival, oracle tests and stage-level diagnostics</a><span>Find where required facts disappear and isolate retrieval from generation limitations.</span></li>
<li><a href="{{ '/ai-engineering/evaluation/agent-trajectories-judges/' | relative_url }}">Agent trajectory evaluation, tool safety and LLM judges</a><span>Policy invariants, judgment calibration and regression datasets.</span></li>
</ul>
