---
title: "Pipeline architecture"
nav_title: Overview
description: "ETL, ELT, batch, streaming, and choosing where transformations run."
chapter: foundations
order: 0
sequence: 100
level: Chapter overview
---

Define source and output promises, choose bounded or ongoing computation, and estimate volume and recovery capacity. Durable input, checkpoints and publication records explain what a rerun can safely repeat.

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/data-engineering/foundations/etl-elt-and-pipelines/' | relative_url }}">ETL, ELT, and the source-to-warehouse path</a><span>Follow an event through the pipeline and decide where transformation belongs.</span></li>
<li><a href="{{ '/data-engineering/foundations/capacity-estimation/' | relative_url }}">Data capacity and back-of-the-envelope calculations</a><span>Volume, state, headroom, file counts, replay time and cost envelopes.</span></li>
<li><a href="{{ '/data-engineering/foundations/pipeline-run-lifecycle/' | relative_url }}">Pipeline fundamentals: contracts, checkpoints and publication</a><span>Define durable input, stage progress and verified consumer releases.</span></li>
</ul>
