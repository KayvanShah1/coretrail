---
title: "Practice & revision"
nav_title: "Overview"
description: "Apply the patterns, compare dialects, and test your understanding."
keywords:
  - SQL interview questions
  - dialect differences
  - revision drills
aliases:
  - SQL practice problems
chapter: "practice"
order: 0
sequence: 1400
level: "Chapter overview"
---

## Choose the pattern yourself

Use this chapter to check whether you can choose the technique without the chapter name giving it away. Attempt the query before opening the worked solution, then keep a short note on the mistake or assumption that changed your answer.


## Decision reference

| Goal | Practice mode |
|---|---|
| Recall syntax | Chapter quick references |
| Recognize recurring problems | Pattern cookbook |
| Solve without a label | Mixed drills |
| Explain performance choices | Diagnosis drills |
| Collect execution evidence | Native PostgreSQL labs |

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/sql/practice/platform-problems/' | relative_url }}">Find your next SQL problem</a><span>Filter questions from StrataScratch, LeetCode, and DataLemur by topic and level.</span></li>
<li><a href="{{ '/sql/practice/pattern-map/' | relative_url }}">Choose the right technique</a><span>Translate interview wording into candidate query patterns.</span></li>
<li><a href="{{ '/sql/practice/revision-drills/' | relative_url }}">Revision drills</a><span>Work through a deliberate sequence of query challenges.</span></li>
<li><a href="{{ '/sql/practice/dialects/' | relative_url }}">SQL dialect differences</a><span>Translate common operations between PostgreSQL, BigQuery, and MySQL.</span></li>
<li><a href="{{ '/sql/practice/largest-olympics/' | relative_url }}">Largest Olympics</a><span>Count distinct athletes, then keep every tied maximum.</span></li>
<li><a href="{{ '/sql/practice/apple-users/' | relative_url }}">Apple Product Counts</a><span>Reduce device events to one flag per user.</span></li>
<li><a href="{{ '/sql/practice/spam-posts/' | relative_url }}">Spam Posts</a><span>See why distinct posts and view records give different percentages.</span></li>
<li><a href="{{ '/sql/practice/rank-changes/' | relative_url }}">Country rank changes</a><span>Rank each period separately before comparing countries.</span></li>
<li><a href="{{ '/sql/practice/top-percent/' | relative_url }}">Top 5%: thresholds & quotas</a><span>Distinguish percentile cutoffs from a fixed count of rows.</span></li>
<li><a href="{{ '/sql/practice/campaign-purchases/' | relative_url }}">Later purchases of new products</a><span>Compare later purchases with the complete first-day product set.</span></li>
<li><a href="{{ '/sql/practice/retention-joins/' | relative_url }}">Retention and the denominator</a><span>Understand why an outer join can be necessary.</span></li>
<li><a href="{{ '/sql/practice/theory-questions/' | relative_url }}">Database interview questions</a><span>Practice concise explanations of the concepts behind SQL queries.</span></li>
<li><a href="{{ '/sql/practice/problem-index/' | relative_url }}">Practice problem index</a><span>Find a problem by technique and difficulty, then compare the worked reasoning.</span></li>
<li><a href="{{ '/sql/practice/references/' | relative_url }}">Sources, scope & coverage</a><span>Understand what the handbook covers and where to verify dialect-specific details.</span></li>
<li><a href="{{ '/sql/practice/mixed-drills/' | relative_url }}">Mixed SQL practice with progressive hints</a><span>Identify the grain and technique without being told the pattern in advance.</span></li>
<li><a href="{{ '/sql/practice/diagnosis-drills/' | relative_url }}">Practice: diagnose before optimizing</a><span>Use symptoms and evidence to choose your next investigation, then compare the reasoning.</span></li>
<li><a href="{{ '/sql/practice/payment-merchant-queries/' | relative_url }}">Payments and merchants: SQL interview exercises</a><span>Rank recent successful payments and preserve merchants without valid events.</span></li>
</ul>

## Mix the problems

Do not work through ten versions of the same pattern in a row. Mix joins, aggregation, windows, dates, and existence problems so the technique is not obvious from context. When a query fails, keep the smallest input that exposes why and retry it later without the old solution.
