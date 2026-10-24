---
title: "Data modelling and transactions"
description: "Data modelling and transactions."
chapter: "modelling"
order: 0
sequence: 150
level: "Chapter overview"
nav_title: "Overview"
last_verified: "2026-10-25"
---

An entity, an event, a snapshot and a historical version have different grains. Declare that meaning and the relationship rules before choosing keys, joins or storage. Transaction scope then determines which invariants survive concurrent changes.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/data-engineering/modelling/models-keys-relationships/' | relative_url }}">Data models, keys and relationship cardinality</a><span>Relational, document, key-value, wide-column and graph representations with explicit keys.</span></li>
<li><a href="{{ '/data-engineering/modelling/dimensional-facts-schemas/' | relative_url }}">Dimensional modelling, star schemas and fact grain</a><span>Star and snowflake schemas, facts, additivity and bridge allocation.</span></li>
<li><a href="{{ '/data-engineering/modelling/scd-temporal-history/' | relative_url }}">Slowly changing dimensions and temporal history</a><span>Types 0–7, time boundaries, late changes and history growth.</span></li>
<li><a href="{{ '/data-engineering/modelling/transactions-acid-consistency/' | relative_url }}">ACID, transactional workloads and cross-system consistency</a><span>OLTP/OLAP/HTAP, isolation, distributed effects, outbox and publication.</span></li>
</ul>
