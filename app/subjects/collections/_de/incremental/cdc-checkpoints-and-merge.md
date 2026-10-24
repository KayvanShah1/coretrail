---
title: "Watermarks, CDC, MERGE, and idempotency"
description: "Keep incremental data accurate despite duplicates, late events, updates and retries."
chapter: incremental
order: 1
sequence: 201
level: Core
keywords:
  - Watermarks, CDC, MERGE, and idempotency
interview_queries:
  - explain watermarks, cdc, merge, and idempotency
---

An incremental pipeline reads source changes since a checkpoint. The checkpoint could be a timestamp, source sequence, transaction-log offset or vendor cursor. Its semantics determine whether a gap or replay can occur.

## Why a timestamp can fail

Suppose the last successful run saved updated_at = 12:00. A source change arriving later with updated_at = 11:58 would never be read by a strict greater-than query. Some systems intentionally re-read overlapping intervals and deterministically deduplicate destination rows. That strategy assumes an acceptable bound on lateness; it is not a universal guarantee.

Change data capture (CDC) reads inserts, updates and deletes from a change feed or database log. During a zero-downtime migration, an initial snapshot and a captured stream need to cover changes made during the snapshot. Apply updates in the source-defined order and reconcile before switching consumers.

## One row per business key

~~~sql
SELECT * EXCEPT(rn)
FROM staging.events
QUALIFY ROW_NUMBER() OVER (
  PARTITION BY event_id
  ORDER BY source_version DESC, ingestion_ts DESC
) = 1;
~~~

This BigQuery query chooses the latest staged version, assuming both ordering fields are meaningful. A MERGE with event_id as a key can update or insert the destination, but a merge is only safe when the staged source is unique at the target grain and the update rule rejects stale changes. Deletes require explicit tombstones or operation codes.

If the CDC feed introduces a new event or column version, retain enough source metadata to interpret old and new changes during replay. Version-aware canonical mappings and a consumer migration process are covered in [Schema evolution and data contracts]({{ '/data-engineering/reliability/schema-evolution-and-contracts/' | relative_url }}).

## Retrying correctly

If the destination committed but checkpoint persistence failed, the next attempt must safely replay. If checkpoint persistence succeeded before the destination committed, records could be lost. Record extraction ranges, source offsets, stage counts, merge results and the last verified destination checkpoint.

Exactly-once effects across independent systems require a protocol; saying “we use MERGE” is not enough. The interviewer may ask how duplicate keys, same-timestamp ties and partial failures are handled.
