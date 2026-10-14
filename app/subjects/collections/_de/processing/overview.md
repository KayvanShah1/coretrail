---
title: "Distributed processing"
nav_title: Overview
description: "Spark, Beam, Dataflow, event time, and skew."
chapter: processing
order: 0
sequence: 500
level: Chapter overview
---

Distributed processing includes both finite jobs and continuously running processors. Batch tuning focuses on stages and data movement; streaming operations also have to preserve event-time behavior, message compatibility and processing state across deployments.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/data-engineering/processing/spark-beam-and-time/' | relative_url }}">Spark execution, Dataflow, shuffles, and watermarks</a><span>Compare distributed processing engines and explain skew or late-event failures.</span></li>
<li><a href="{{ '/data-engineering/processing/streaming-schema-evolution/' | relative_url }}">Schema evolution in real-time pipelines</a><span>Kafka/Pub/Sub schema versions, rolling upgrades, state migration, Dataflow replacement and sink compatibility.</span></li>
</ul>
