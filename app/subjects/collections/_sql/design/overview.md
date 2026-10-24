---
title: "Database design"
nav_title: "Overview"
description: "Model relationships, dependencies, and analytical history."
keywords:
  - normalization
  - functional dependencies
  - dimensional modeling
  - slowly changing dimensions
aliases:
  - data modeling
chapter: "design"
order: 0
sequence: 800
level: "Chapter overview"
---

## Start with what one row represents

A schema is a choice about entities, relationships, history, and access. Normalization addresses dependencies; dimensional modeling makes analytical grain and history explicit. Learn what problem each approach solves.


## Decision reference

| Design question | Concept |
|---|---|
| What determines an attribute? | Functional dependency |
| Where should a fact be stored? | Normalization |
| What does a measured row represent? | Fact grain |
| How do attributes change over time? | Slowly changing dimensions |
| Which data can a query skip? | Physical layout; see performance |

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/design/normalization/' | relative_url }}">Normalization & functional dependencies</a><span>Reduce update anomalies by storing each fact at its natural grain.</span></li>
<li><a href="{{ '/sql/design/dimensional-modeling/' | relative_url }}">Resolving dimension versions in analytical SQL</a><span>Resolve historical versions and detect missing or overlapping matches.</span></li>
</ul>

## Start from the question the model must answer

State the grain first. Then decide where each fact belongs, what can change over time, and which historical answer must remain reproducible.
