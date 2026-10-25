---
title: "Cloud architecture, identity and cost"
nav_title: Overview
description: "Choose compute, storage, messaging and identity controls from access patterns and failure requirements."
chapter: cloud
order: 0
sequence: 500
level: Chapter overview
---
Identity and access management (IAM), data placement and workload lifetime determine how a cloud application behaves. An authoritative store needs clear ownership; request paths and asynchronous workers need measurable latency, recovery and cost targets.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/infrastructure/cloud/identity-network-data-path/' | relative_url }}">Cloud identity, network paths and service design</a><span>Understand least-privilege service identities, private access, message/data boundaries and which GCP or AWS service owns each job.</span></li>
<li><a href="{{ '/infrastructure/cloud/gcp-service-decisions/' | relative_url }}">GCP service choices, execution limits and failure cases</a><span>Choose event delivery, queued tasks, workflow coordination and data processing from workload constraints.</span></li>
</ul>

For graphics processing unit (GPU) hosting decisions, compare the [cloud compute options]({{ '/infrastructure/scaling/cloud-workload-selection/' | relative_url }}). For SQL warehouse execution, see [BigQuery slots and shuffles]({{ '/data-engineering/gcp/slots-shuffle-concurrency/' | relative_url }}).
