# CoreTrail writing style and content philosophy

CoreTrail is a revision handbook, not a course, glossary, vendor catalog, or collection of interview answers.

The goal is to leave behind notes that are easy to search, quick to re-enter, and deep enough to recover the reasoning behind a concept. A page should help someone who has seen the topic before understand what it is, why it exists, what usually goes wrong, and how to explain the trade-off without rereading a textbook.

## Write for recall, not completion

A page should answer the question someone is likely to have when they return to the topic:

- What is this concept actually doing?
- Why does this layer exist?
- What changes if this assumption changes?
- What evidence separates one diagnosis from another?
- Which trade-off matters here?
- What terminology would I search for in an interview or incident?

Do not write as if the reader must complete a lesson in order. CoreTrail should work equally well when someone lands directly on a page from search.

That is why canonical terms should stay visible. Use names such as `PRECEDING`, `KV cache`, `TTFT`, `HPA`, `tensor parallelism`, and `readiness probe` when those are the terms people will actually search for. Explain them clearly, but do not hide them behind friendlier wording.

## Let the topic decide the structure

There is no mandatory page template.

A definition-first structure works well when the reader first needs a boundary between terms:

```text
Definition → mechanics or syntax → example → edge case / summary
```

Examples include Pods versus nodes, metrics versus logs versus traces, joins, indexes, or inference engines.

A problem-first structure is better when the page is about behavior, diagnosis, or architecture:

```text
symptom / problem → what actually happens → evidence → trade-off / fix
```

Examples include query performance, autoscaling, backpressure, incident debugging, or production serving architecture.

A flow-first structure works well when order matters:

```text
request → component → state change → next component → failure point
```

Do not force every page through the same headings. Repeated structures should exist because the reasoning repeats, not because the site needs a template.

## Prefer causality over description

The strongest CoreTrail explanations show why the next thing becomes necessary.

Prefer:

> Creating a Pod does not create a GPU. If no suitable node has capacity, the Pod remains Pending, which is when node autoscaling becomes relevant.

Over:

> Kubernetes supports Pods, nodes, autoscaling, and GPU workloads.

Prefer:

> An unbounded queue can turn overload into very high TTFT. Clients then time out and retry, increasing the arrival rate further.

Over:

> Queues are useful for handling traffic spikes.

The first version gives the reader a mental model. The second only names a feature.

## Keep definitions precise, but do not sound like a textbook

Definitions are useful when they establish a boundary. They should be short enough that the page can move quickly into behavior.

Prefer:

> A readiness probe answers whether a Pod should receive traffic right now.

Then explain what can make readiness fail or why “process is alive” is not enough.

Avoid opening every page with:

> X is a powerful technology that enables...

or:

> X refers to the process of...

unless that wording is genuinely the clearest definition.

## Keep the prose natural

CoreTrail should read like technical notes written after building, debugging, or having to explain the system.

Use normal paragraphs. Mix paragraph length naturally. Use bullets, tables, diagrams, and code blocks when they make comparison or flow clearer, not as a substitute for prose.

Avoid:

- stacked one-line fragments;
- every paragraph beginning with a label;
- repetitive “The key is...”, “The important thing is...”, “The point is...”, or “A useful way to think about...” constructions;
- motivational filler;
- fake first-person anecdotes;
- “In today's rapidly evolving landscape...” language;
- generic “Key takeaways” sections that only repeat the page;
- headings such as “Why this matters” when the consequence can be stated directly.

A strong sentence usually names the condition and consequence directly.

Instead of:

> The important thing is that high GPU utilization does not always mean the system is overloaded.

Prefer:

> High GPU utilization can be healthy when continuous batching is keeping the accelerator busy. Queue growth and TTFT tell you more about unserved demand.

## Avoid repeated contrast scaffolding

Contrast is useful when it exposes a real distinction, but it becomes a writing fingerprint when every explanation follows the same shape:

- `X is not Y; it is Z`;
- `not X, but Y`;
- `rather than X`;
- `keep X and Y separate`;
- `the important boundary is...`;
- `the point is not...`.

Use those constructions when the contrast itself carries the explanation. Otherwise state the mechanism or consequence directly.

Prefer:

> HPA can request six Pods. If the cluster has room for only four, the remaining Pods stay Pending until node capacity appears.

Over:

> Workload scaling is not node scaling. Keep the two layers separate.

The first version proves the distinction through behavior.

Watch repeated helper words as well. `useful`, `important`, `boundary`, `layer`, `actually`, `simply`, and `commonly` are normal words, but repeated use across neighboring pages makes the prose sound templated. Reserve `boundary` and `layer` for genuine architectural interfaces or system layers.

Instructional commands can create the same effect. Prefer showing the failure or decision over repeatedly telling the reader `Do not...`, `Keep...`, `Remember...`, or `Start with...`.

## Expand short forms on every page

Search can land a reader directly on any page, so a technical acronym should be expanded at its first meaningful use on that page.

Examples:

- `large language model (LLM)`;
- `graphics processing unit (GPU)`;
- `key-value (KV) cache`;
- `time to first token (TTFT)`;
- `time per output token (TPOT)`;
- `Horizontal Pod Autoscaler (HPA)`;
- `PersistentVolumeClaim (PVC)`;
- `mean time to recovery (MTTR)`.

After the first expansion, use the short form normally.

Do not force product names into artificial acronym expansions. For names such as vLLM, Kubernetes, Karpenter, CUDA, or Triton, explain the product's role when the page needs that context.

Common computing terms such as SQL or HTTP can remain unexpanded when the expanded form would add no useful context, but domain-specific abbreviations should not require the reader to visit a previous page.

## Use questions when they expose the reasoning

Questions are useful when they force a distinction the reader should make:

- What exactly is one output row?
- Does this join change the grain?
- Is the queue growing because arrival rate exceeds service rate?
- Does another replica help if no GPU node can place it?
- Is the bottleneck prefill, decode, memory, or queueing?
- What evidence would justify an index?

Do not turn every page into an FAQ. Use questions where they reveal a decision.

## Concept before tool

Teach the durable mechanism first. Product names belong where they help attach the mechanism to a real implementation.

Prefer:

> A workload autoscaler changes desired replica count. A node autoscaler changes machine capacity. In Kubernetes, HPA/KEDA and Karpenter are examples of those two different loops.

Over:

> KEDA does X, Karpenter does Y, HPA does Z.

The first explanation survives tool changes.

The same rule applies to AI infrastructure:

- teach inference scheduling before listing inference engines;
- teach multi-GPU communication before listing network products;
- teach inference-aware routing before describing one vendor gateway;
- teach observability signals before naming telemetry backends.

One running implementation can still be valuable. vLLM, PostgreSQL, Kubernetes, or Prometheus may appear often when they provide a concrete system to reason about. They should remain examples of the concept, not become the concept itself.

## Keep deep implementation detail proportional

A page can go deep when the detail changes the mental model or explains a common failure.

Keep details such as:

- why KV cache consumes per-request GPU memory;
- why a logical replica may span several GPUs;
- why readiness is different from liveness;
- why window-frame boundaries change results;
- why partitioning or indexing changes access cost.

Trim details that are mainly ecosystem trivia unless the page specifically owns that topic.

For example, an AI-serving page needs to explain that same-node and cross-node GPU communication have different costs. It usually does not need a catalog of RDMA technologies. A future infrastructure page can own that depth if it becomes useful.

Mark material as **Optional deep dive** when it is valuable but not required for the core mental model.

## Keep subject ownership clear

Put the generic mechanism where it belongs, then link to the specialized version.

Examples:

- load balancing, queues, backpressure, caching, replication, and failure domains are System Design concepts;
- containers, Kubernetes, networking, CI/CD, infrastructure as code, and observability mechanics belong to Infrastructure & DevOps;
- pipelines, warehouses, streaming, modeling, and orchestration belong to Data Engineering;
- conventional training, evaluation, features, serving, and MLOps belong to Machine Learning;
- LLM inference, RAG, agents, LLM evaluation, and LLM-specific serving constraints belong to AI Engineering.

AI pages should explain what changes because the workload is an LLM. They should link back to reusable infrastructure or system-design mechanics instead of re-teaching them in full.

## Cross-link instead of duplicating

Duplication makes the handbook drift.

If one page already explains HPA versus node autoscaling, an AI page should summarize only the part needed for the LLM-specific decision and link to the Infrastructure page.

If one page owns window-frame semantics, another SQL pattern page should link to it instead of rebuilding the explanation.

A short recap is fine when it is necessary for continuity. Repeating the same full explanation in multiple subjects is not.

## Make headings searchable

Headings should use the terminology a reader expects to search for.

Prefer:

- `Prefill, decode, and KV cache`
- `Rate limits, concurrency, and backpressure`
- `Tensor parallelism and pipeline parallelism`
- `ROWS vs RANGE`
- `Workload versus node autoscaling`

Avoid clever headings that hide the concept:

- `The hidden memory problem`
- `When the cluster fights back`
- `Making windows behave`

A natural title can still have personality, but the canonical term should remain visible.

## Use examples to prove the explanation

Examples should expose behavior, not decorate the page.

A useful example does at least one of these:

- makes an abstract boundary concrete;
- shows a wrong-but-plausible result;
- demonstrates a failure mode;
- makes scale or cost tangible;
- shows how the same architecture behaves under a different assumption.

Production examples should be labeled as examples. Do not present one vendor architecture as the canonical design.

If a number is specific to a benchmark, model, cloud setup, or date, qualify it and cite the primary source.

## Diagrams should carry reasoning

Use diagrams when sequence, ownership, or relationships are easier to understand visually.

A good CoreTrail diagram answers something like:

- where does the request go?
- which scheduler owns which decision?
- when does machine provisioning happen?
- how does grain change?
- which state survives a restart?

Choose the visual form from what the reader needs to inspect. Mermaid works well for branching flows, state transitions and dependency graphs. Detailed schemas, nested architecture views, storage layouts, timelines and annotated execution plans often need an SVG illustration or an image from official documentation.

Use an official image directly when its details support the explanation and its reuse terms permit redistribution. Preserve the source artwork, credit its author and license, and keep a local copy under `app/assets/img/site/<subject>/<chapter>/<topic>/<descriptive-name>.<ext>`. Original CoreTrail illustrations use the same hierarchy and identify the primary references behind their mechanics.

Use `figure.html` with an entry in `app/_data/figures.json` for static figures. Record the source page, original asset URL, retrieval date, dimensions, checksum and reuse terms. Include alt text and a caption that explains how to read the figure. Keep internal labels readable with a keyboard-accessible scroll region and a full-size link. Preserve the original colors and background across site themes.

A diagram should have an adjacent text explanation. Mermaid figures also retain their text fallback. Replace overlapping figures when a more detailed image teaches the same relationship; keep a flowchart when it explains a separate process.

Do not add a diagram merely because the page feels text-heavy.

## Tables are for distinctions

Tables work best when the columns encode a real comparison:

| Question                       | Good table use                         |
| ------------------------------ | -------------------------------------- |
| What changes?                  | traditional ML serving vs LLM serving  |
| Who owns the decision?         | workload autoscaler vs node autoscaler |
| Which symptom points where?    | queue pressure vs decode slowdown      |
| Which operation changes grain? | join / aggregate / window              |

Do not convert prose into a table just to make a page look structured.

## References support claims, not decoration

Prefer primary documentation, specifications, papers, and official engineering material.

A reference should support something the page actually says. Do not add a References section that is empty or filled with generic links.

For fast-moving implementation details, qualify the wording:

> vLLM currently describes this feature as experimental.

is better than:

> This is how disaggregated inference works in production.

Keep exact benchmark numbers tied to the source and setup.

## Search metadata is part of writing

Metadata exists so someone can find the page using the phrase they remember.

Use:

- `keywords` for canonical related terms;
- `aliases` for alternate names and acronyms;
- `tools` for products strongly associated with the topic;
- `interview_queries` for a small set of natural questions.

Do not use metadata as broad SEO tags.

A page about autoscaling can include `TTFT`, `queue depth`, `HPA`, or `Karpenter` if those concepts genuinely appear. It should not add `AI`, `cloud`, or `production` just to rank for more searches.

Search should retrieve the canonical concept even when navigation puts it several levels deep.

## Navigation organizes concepts; search ignores hierarchy

Keep the visible hierarchy shallow:

```text
Subject → Chapter → Topic page
```

Use `##` and `###` inside a topic instead of creating more navigation levels.

Navigation should help someone learn the subject in a reasonable order. Search should let someone jump straight to `KV cache`, `PRECEDING`, `Karpenter`, or `cardinality estimate` without knowing where the page lives.

## Before adding a section, ask

1. Does this change the reader's mental model?
2. Is this the subject that owns the concept?
3. Is the terminology searchable?
4. Is the detail durable, or is it mostly current-tool trivia?
5. Is the same explanation already present elsewhere?
6. Does the example prove something?
7. Can the claim be stated more directly?
8. Would a diagram or table explain the relationship better than prose?
9. Does a time-sensitive or implementation-specific claim need a primary reference?
10. If this section disappeared, would the reader lose anything important?

If the answer to the last question is no, the section probably does not belong.

## The target voice

The target is technical, causal, practical, and interview-aware without sounding like interview coaching.

A CoreTrail page should feel like:

> I understand this well enough to explain what happens, where it fails, and what changes the decision.

not:

> Here is a comprehensive guide to everything associated with this topic.

Depth is useful when it makes the explanation shorter and more precise later.
