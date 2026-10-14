---
title: "Feature engineering & stores"
nav_title: Overview
description: "Construct features without future information and serve them consistently."
chapter: features
order: 0
sequence: 100
level: Chapter overview
keywords:
  - feature engineering
  - feature store
  - point in time
---

A model training row represents a prediction made with information available at that instant. Feature transformations, joins and updates need to respect that assumption. For online inference, there is another constraint: can the service retrieve those values within its latency budget?

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/ml/features/feature-preparation-encodings/' | relative_url }}">Numerical and categorical feature preparation</a><span>Transformations, missingness, target encoding, fitted statistics and training parity.</span></li>
<li><a href="{{ '/ml/features/point-in-time-features/' | relative_url }}">Point-in-time joins and availability leakage</a><span>Choose historical feature versions using both event and availability timestamps.</span></li>
<li><a href="{{ '/ml/features/feature-stores/' | relative_url }}">Offline and online feature stores</a><span>Historical training, low-latency serving, materialization and consistency checks.</span></li>
</ul>
