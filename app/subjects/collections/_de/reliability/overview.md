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
</ul>
