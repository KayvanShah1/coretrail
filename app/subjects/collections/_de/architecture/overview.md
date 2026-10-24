---
title: "Warehouse and processing architectures"
description: "Warehouse and processing architectures."
chapter: "architecture"
order: 0
sequence: 175
level: "Chapter overview"
nav_title: "Overview"
last_verified: "2026-10-25"
---

A data architecture assigns responsibility for source capture, integration, history, computation and consumer access. Integration style, processing topology, storage format and domain ownership can be combined when their contracts remain explicit.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/data-engineering/architecture/warehouse-integration-patterns/' | relative_url }}">Kimball, Inmon, Data Vault and hybrid warehouse design</a><span>Choose integration and presentation models from audit and delivery needs.</span></li>
<li><a href="{{ '/data-engineering/architecture/lambda-kappa-medallion/' | relative_url }}">Lambda, Kappa, medallion and hybrid processing</a><span>Separate processing/replay, data-quality and domain-ownership decisions.</span></li>
</ul>
