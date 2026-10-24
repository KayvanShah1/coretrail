---
title: "Incremental ingestion & CDC"
nav_title: Overview
description: "Watermarks, change streams, idempotency and recovery."
chapter: incremental
order: 0
sequence: 200
level: Chapter overview
---

A cursor is useful only while its source history remains available. Define source ordering, stable event identity and sink-version rules so duplicates and delayed updates converge to the correct state.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/data-engineering/incremental/cdc-checkpoints-and-merge/' | relative_url }}">Watermarks, CDC, MERGE, and idempotency</a><span>Keep incremental data accurate despite duplicates, late events, updates and retries.</span></li>
</ul>

For a full recovery procedure, see [resumable pipelines, replay and backfills]({{ '/data-engineering/reliability/recovery-replay-backfills/' | relative_url }}).
