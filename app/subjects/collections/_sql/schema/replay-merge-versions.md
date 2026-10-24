---
title: "MERGE, late updates, and replay correctness"
description: "Apply change versions safely when retries, duplicate keys and deletes arrive."
chapter: schema
order: 5
sequence: 905
level: Intermediate
keywords:
  - "MERGE, late updates, and replay correctness"
interview_queries:
  - "explain merge, late updates, and replay correctness"
references:
  - title: BigQuery MERGE
    url: https://cloud.google.com/bigquery/docs/reference/standard-sql/dml-syntax#merge_statement
---

An incremental writer receives changes for the same business key across multiple runs. A retry may deliver a record twice; a delayed source message may describe an older state; a delete may arrive as a tombstone. A simple upsert can silently overwrite a newer target with stale data.

## Deduplicate before updating a target

First choose one source version per business key. The ordering field must represent the source's change order, not merely the time a worker happened to receive the message.

~~~sql
-- BigQuery Standard SQL; source_version increases for each entity.
CREATE TEMP TABLE stage_latest AS
SELECT event_id, amount, source_version, is_deleted
FROM staging.events
QUALIFY ROW_NUMBER() OVER (
  PARTITION BY event_id
  ORDER BY source_version DESC
) = 1;
~~~

If two conflicting records can share source_version, this query has no deterministic winner. Add a stable source sequence or another contract-defined tie-breaker, and treat an unresolved version collision as a data-quality error.

## Avoid overwriting newer target state

~~~sql
MERGE analytics.current_events AS t
USING stage_latest AS s
ON t.event_id = s.event_id
WHEN MATCHED AND s.source_version > t.source_version THEN
  UPDATE SET amount = s.amount,
             source_version = s.source_version,
             is_deleted = s.is_deleted
WHEN NOT MATCHED THEN
  INSERT (event_id, amount, source_version, is_deleted)
  VALUES (s.event_id, s.amount, s.source_version, s.is_deleted);
~~~

This example retains a deletion flag rather than physically deleting a row. Keeping the tombstone prevents a replay of an older insert from resurrecting deleted data. It assumes stage_latest has at most one row per key and that source_version is comparable for all versions of that key.

A physical DELETE is possible, but then the application needs a separate high-watermark or tombstone mechanism if old events may be replayed later.

## Two commit failures

If the warehouse write succeeds and the checkpoint update fails, the next run repeats the same input. Version-aware writes should leave the destination unchanged on replay. If the checkpoint advances before the warehouse commits, the next run can skip the missing records permanently.

A staging table tied to a run ID, durable source cursor, and explicit commit/checkpoint ordering make those cases recoverable. Transaction capabilities vary by engine, especially across multiple services.

## Validate the result

Reconcile unique source keys, rejected duplicates, updates applied, tombstones processed and the target's highest committed source versions. A source-to-target count comparison alone will not catch stale overwrites.

For PostgreSQL's ON CONFLICT and MERGE semantics, see [Upserts & MERGE]({{ '/sql/schema/upsert-merge/' | relative_url }}). For extraction and offset behavior, see [Watermarks, CDC, MERGE, and idempotency]({{ '/data-engineering/incremental/cdc-checkpoints-and-merge/' | relative_url }}).
