---
title: "Schema & data changes"
nav_title: "Overview"
description: "Define tables, enforce constraints, and modify data safely."
keywords:
  - DDL
  - DML
  - constraints
  - UPSERT
  - MERGE
aliases:
  - database schema
chapter: "schema"
order: 0
sequence: 900
level: "Chapter overview"
---

## What rule should the database enforce?

Tables and constraints encode assumptions that query authors otherwise have to guess. Data changes introduce another question: what must happen atomically, and what happens when a write conflicts or repeats?


## Decision reference

| Operation | Start with |
|---|---|
| Define or change structure | CREATE / ALTER TABLE |
| Enforce identity or relationships | PRIMARY KEY / UNIQUE / FOREIGN KEY |
| Enforce row rules | NOT NULL / CHECK |
| Change rows | INSERT / UPDATE / DELETE |
| Handle conflicts | ON CONFLICT / MERGE; engine-specific semantics |

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/schema/constraints/' | relative_url }}">Keys, constraints & defaults</a><span>Encode data rules in the database and understand what each constraint guarantees.</span></li>
<li><a href="{{ '/sql/schema/ddl/' | relative_url }}">CREATE, ALTER, DROP & TRUNCATE</a><span>Distinguish changing a table's structure from changing its rows.</span></li>
<li><a href="{{ '/sql/schema/dml/' | relative_url }}">INSERT, UPDATE & DELETE</a><span>Change exactly the intended rows and inspect the results.</span></li>
<li><a href="{{ '/sql/schema/upsert-merge/' | relative_url }}">Upserts & MERGE</a><span>Define how incoming records interact with existing keys.</span></li>
<li><a href="{{ '/sql/schema/replay-merge-versions/' | relative_url }}">MERGE, late updates, and replay correctness</a><span>Use source versions and tombstones to prevent stale updates and duplicate effects.</span></li>
</ul>

## Check the invariant

For every constraint or write pattern, state the rule the database is protecting. Then ask what happens on duplicate input, partial failure, or a retry.
