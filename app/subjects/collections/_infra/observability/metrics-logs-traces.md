---
title: "Metrics, logs, and traces"
description: "Use aggregate measurements, event records, and request paths together to explain distributed-system behavior."
chapter: observability
order: 1
sequence: 401
level: Core
keywords:
  - metrics
  - logs
  - traces
  - telemetry
  - distributed tracing
  - time series
aliases:
  - three pillars of observability
tools:
  - OpenTelemetry
  - Prometheus
  - Grafana
interview_queries:
  - metrics vs logs vs traces
  - when do you use distributed tracing
  - what does Prometheus do
references:
  - title: OpenTelemetry signals
    url: https://opentelemetry.io/docs/concepts/signals/
  - title: OpenTelemetry observability primer
    url: https://opentelemetry.io/docs/concepts/observability-primer/
  - title: Prometheus getting started
    url: https://prometheus.io/docs/tutorials/getting_started/
---

Each signal has a different natural shape.

| Signal | Good at answering |
|---|---|
| Metrics | Is this happening, how much, and since when? |
| Logs | What event/detail did this component record? |
| Traces | Where did this request spend time across components? |

## Metrics compress behavior over time

Examples:

```text
request rate
95th-percentile (p95) latency
error rate
queue depth
central processing unit (CPU) / graphics processing unit (GPU) memory
running replicas
```

Prometheus stores metrics as labeled time series and is commonly used for scraping, querying, and alerting on those measurements.

Metrics are efficient for dashboards and alerts, but an aggregate spike may not tell you which individual request caused it.

## Logs preserve event detail

Structured logs can capture:

```text
timestamp
severity
service
request / trace id
event
model/version
error code
context fields
```

They are useful for component-specific details and forensic inspection.

A wall of unstructured strings without stable fields becomes difficult to correlate at scale.

## Traces connect work across service boundaries

A distributed trace follows one logical request. It can contain spans in the gateway, application programming interface (API), retrieval service, model endpoint and database. Parent-child relationships and timestamps show how their work contributed to the request.

It is useful when the end-to-end latency is bad but individual service averages look normal.

## Correlation makes the signals stronger

A trace/span ID in logs lets you move from a slow trace to detailed events.

A metric alert can tell you which service/region to inspect.

The signals are complements, not competing observability products.

## OpenTelemetry versus a backend

OpenTelemetry is a vendor-neutral framework for instrumenting, generating, collecting, and exporting telemetry such as traces, metrics, and logs.

Prometheus can collect, store, and query time-series metrics. Grafana can visualize and alert over those and other data sources.

The products can be replaced; the operational responsibilities remain metrics collection/query, visualization/alerting, and telemetry correlation.
