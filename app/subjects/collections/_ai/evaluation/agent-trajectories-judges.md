---
title: "Agent trajectory evaluation, tool safety and LLM judges"
description: "Check actions, state transitions, outcomes and policy invariants using deterministic tests and calibrated model-based judging."
chapter: evaluation
order: 5
sequence: 805
level: Intermediate
mermaid: true
keywords: [agent trajectory, tool accuracy, LLM as judge, rubric calibration, regression evaluation, policy gate, adversarial tests]
aliases: [agent trace evaluation, agentic AI guardrails]
interview_queries: [how to evaluate agents, can LLM judges be trusted, how to test agent safety]
---
An agent can produce a convincing summary after making the wrong tool call. Conversely, two safe agents can reach the same correct state through different sequences. Evaluation should inspect what happened, what changed and which actions were authorized, while allowing multiple valid plans where the task permits them.

## Trace actions with versioned initial conditions

A reproducible case records initial session state, tool schemas, permissions, dependency stubs or snapshots, prompt and model revisions, maximum allowed steps and expected final state. The trajectory includes proposed calls, validated arguments, tool responses, retries, errors and side effects.

For a collection workflow, the expected outcome may require confirming identity before looking up a balance, then offering only policy-permitted payment options. A generated answer that states the correct balance is still a failure if a balance lookup occurred before identity confirmation.

{% capture diagram_code %}
flowchart TD
A["Case: initial state + policy + allowed tools"] --> B["Run agent with traced steps"]
B --> C["Validate schema / parameters"]
B --> D["Check permission and ordering invariants"]
B --> E["Inspect external side effects"]
B --> F["Evaluate final task result"]
C --> G["Case-level verdict and failure attribution"]
D --> G
E --> G
F --> G
G --> H["Regression case + monitored release gate"]
{% endcapture %}
{% capture diagram_fallback %}
A versioned case runs the agent. Independent checks verify tool schema, permissions, action ordering, actual side effects and final task success. Results contribute to a release gate and regression set.
{% endcapture %}
{% include diagram.html title="Agent evaluation checks what happened before judging the final answer" code=diagram_code fallback=diagram_fallback caption=true %}

## Tests that should be executable

Validate JSON/schema types, allowed enumerations, active inventory filters, SQL result rows, policy constraints and side effects through deterministic checks. Track **tool-call validity**, **correct tool choice**, **final-state correctness**, **task completion** and **policy violations** separately.

Trajectory equality is usually too strict for flexible tasks: calling search twice can be valid if the first result is insufficient. For irreversible actions, order and cardinality invariants *are* strict: no duplicate charge, no unauthorized record access, and required approval before commitment.

Stateful evaluation should include corrections, interrupted runs and long sessions. A request such as “change the budget, keep the city” tests whether the application state honors the update without losing retained constraints.

## LLM-as-judge is a measurement instrument

A model judge can score open-ended explanations for correctness, grounding and completeness using an explicit rubric. It may reward verbosity, familiar phrasing or its own preferred answer. Pairwise judging can exhibit position bias; pointwise scoring can drift as the judge model changes.

Build a human-labeled calibration sample, measure disagreements and re-review borderline or high-severity cases. Freeze judge version, prompt, retrieved evidence and rubric. Deterministic facts such as a computed balance or source ID should not be delegated to a subjective judge when an executable test can settle them.

A judge reading only the final answer cannot establish that the tool sequence was safe. Give it the relevant evidence and trace only within the authorized review scope.

## Release gates and failure cohorts

A 95% task pass rate can hide unacceptable privacy violations on a handful of cases. Track severe constraints independently of averages. Useful cohorts include: unsupported actions, unauthorized documents, alias mismatches, long-context state loss, corrupted tool output, rate-limit retries, interrupted writes and no-answer requests.

Measure tokens, external tool cost, model retries, response latency and **cost per completed successful task** alongside quality. Reserve independent held-out cases; continuously expanding the regression suite from production failures is valuable, but tuning directly against a fixed holdout eventually makes it a development set.

See [shared context and handoffs]({{ '/ai-engineering/agents/shared-context-handoffs/' | relative_url }}) and [golden datasets]({{ '/ai-engineering/evaluation/golden-datasets-contamination/' | relative_url }}).
