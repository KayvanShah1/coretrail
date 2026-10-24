---
title: "Reliability & operations"
nav_title: Overview
description: "Data quality, reconciliation, monitoring, failures and deployments."
chapter: reliability
order: 0
sequence: 700
level: Chapter overview
---

A pipeline can complete successfully and still publish a broken dataset. Investigate data quality, schema changes, downstream contracts and recovery together: a new source field may ingest correctly but break a transformation or change the meaning of a metric.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/data-engineering/reliability/quality-incidents-and-cicd/' | relative_url }}">Reconciliation, schema drift, incident recovery, and CI/CD</a><span>Restore trustworthy data and identify the layer responsible for production regressions.</span></li>
<li><a href="{{ '/data-engineering/reliability/schema-evolution-and-contracts/' | relative_url }}">Schema evolution, data contracts, and safe migrations</a><span>Source schema changes, curated mappings, consumer contracts and migration plans.</span></li>
<li><a href="{{ '/data-engineering/reliability/stream-delivery-replay/' | relative_url }}">Streaming acknowledgments, retries and replay safety</a><span>Pub/Sub deadlines, idempotent warehouse writes and backpressure.</span></li>
<li><a href="{{ '/data-engineering/reliability/diagnosis-symptoms-evidence/' | relative_url }}">Diagnosing data failures from symptoms and evidence</a><span>Trace wrong values, freshness lag and resource problems to discriminating evidence.</span></li>
<li><a href="{{ '/data-engineering/reliability/recovery-replay-backfills/' | relative_url }}">Resumable pipelines, replay, backfills and safe recovery</a><span>Recover uncertain effects, isolate historical repairs and validate RPO/RTO.</span></li>
<li><a href="{{ '/data-engineering/reliability/metadata-lineage-tools/' | relative_url }}">Pipeline metadata, lineage and tracking tools</a><span>Choose control records, artifacts, OpenLineage, catalogs and telemetry.</span></li>
</ul>
