---
title: "Operations & observability"
nav_title: "Overview"
description: "Use metrics, logs, traces, and health state together to explain what a distributed workload is doing."
chapter: observability
order: 0
sequence: 400
level: "Chapter overview"
keywords:
  - observability
  - metrics
  - logs
  - traces
  - monitoring
aliases:
  - telemetry
tools:
  - OpenTelemetry
  - Prometheus
  - Grafana
interview_queries:
  - metrics vs logs vs traces
  - what is observability
references:
  - title: OpenTelemetry documentation
    url: https://opentelemetry.io/docs/
  - title: OpenTelemetry signals
    url: https://opentelemetry.io/docs/concepts/signals/
---

Monitoring usually starts from conditions you already know to watch: latency above a threshold, an error-rate spike, a failed health check, or a saturated resource. Observability is the evidence available when you need to explain why the system reached that state.

Metrics show how behavior changes over time, logs preserve event detail, and traces connect one request across components. None of the three is sufficient for every incident; correlation between them shortens the path from symptom to cause.

Operationally, the sequence is usually:

1. Identify the affected service and time window from the symptom.
2. Inspect metrics for the scale and duration of the change.
3. Follow traces or request IDs into the relevant logs.
4. Confirm the failing component or dependency against that evidence.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/infrastructure/observability/metrics-logs-traces/' | relative_url }}">Metrics, logs, and traces</a><span>Use each signal for the questions it answers best and correlate them through request/context identifiers.</span></li>
</ul>
