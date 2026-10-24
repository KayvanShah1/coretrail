---
title: "Cloud architecture, IAM and cost"
nav_title: Overview
description: "Choose compute, storage, messaging and identity controls from access patterns and failure requirements."
chapter: cloud
order: 0
sequence: 500
level: Chapter overview
---
A managed cloud product removes some operating work, but the data path still determines reliability and cost. Start by identifying the authoritative store, access patterns, workload lifetime, isolation requirements and service-level objectives.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/infrastructure/cloud/identity-network-data-path/' | relative_url }}">Cloud identity, network paths and service design</a><span>Understand least-privilege service identities, private access, message/data boundaries and which GCP or AWS service owns each job.</span></li>
</ul>

For GPU hosting decisions, compare [Cloud Run, GKE, Vertex AI and EKS]({{ '/infrastructure/scaling/cloud-workload-selection/' | relative_url }}). For SQL warehouse execution, see [BigQuery slots and shuffles]({{ '/data-engineering/gcp/slots-shuffle-concurrency/' | relative_url }}).
