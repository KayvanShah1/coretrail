---
title: "Orchestration & transformations"
nav_title: Overview
description: "Airflow, Cloud Composer, dbt, retries, and backfills."
chapter: orchestration
order: 0
sequence: 600
level: Chapter overview
---

Airflow, Cloud Composer, dbt, retries, and backfills. Start by identifying the record grain, the actual computation, and what would break if a dependency failed.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/data-engineering/orchestration/airflow-composer-dbt/' | relative_url }}">Airflow, Composer, dbt, and repeatable backfills</a><span>Separate orchestration from distributed execution and preserve interval correctness.</span></li>
<li><a href="{{ '/data-engineering/orchestration/dagster-argo-workload-control/' | relative_url }}">Dagster, Argo and workload orchestration trade-offs</a><span>Asset materialization, DAG scheduling, Kubernetes workflows and safe retries.</span></li>
</ul>

For a full recovery procedure, see [resumable pipelines, replay and backfills]({{ '/data-engineering/reliability/recovery-replay-backfills/' | relative_url }}).
