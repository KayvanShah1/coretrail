---
title: "GCP & BigQuery"
nav_title: Overview
description: "Understand distributed query work and investigate analytical capacity."
chapter: gcp
order: 0
sequence: 400
level: Chapter overview
---

BigQuery exposes distributed stages, slots and shuffle. Use the execution reference below to connect those mechanics to stage work. [Workload investigation]({{ '/sql/performance/bigquery-workload-investigation/' | relative_url }}) applies them to query history and the 40 TB sales-table example; [layout trade-offs]({{ '/sql/performance/pruning-layout-tradeoffs/' | relative_url }}) works through BigQuery predicates and clustering.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/data-engineering/gcp/slots-shuffle-concurrency/' | relative_url }}">BigQuery slots, shuffle, and concurrency</a><span>Stage work, join skew, reservations and runtime regressions.</span></li>
</ul>

For cloud-service selection, see [GCP execution, messaging and storage choices]({{ '/infrastructure/cloud/gcp-service-decisions/' | relative_url }}).
