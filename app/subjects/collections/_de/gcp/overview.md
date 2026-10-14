---
title: "GCP & BigQuery"
nav_title: Overview
description: "Query execution, physical layout, capacity and costs."
chapter: gcp
order: 0
sequence: 400
level: Chapter overview
---

Query execution, physical layout, capacity and costs. Start by identifying the record grain, the actual computation, and what would break if a dependency failed.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/data-engineering/gcp/bigquery-execution-and-cost/' | relative_url }}">BigQuery execution, partitioning, clustering, and cost</a><span>Diagnose stage-level work and explain how physical layout changes scans.</span></li>
<li><a href="{{ '/data-engineering/gcp/slots-shuffle-concurrency/' | relative_url }}">BigQuery slots, shuffle, and concurrency</a><span>Explain stage work, join skew, reservation contention and runtime regressions.</span></li>
</ul>
