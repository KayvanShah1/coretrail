---
title: "Vector indexes, ranking and retrieval metrics"
description: "Compare exact search, HNSW, IVF, BM25, reciprocal rank fusion, reranking and the metrics suited to each retrieval task."
chapter: retrieval
order: 3
sequence: 603
level: Core
math: true
mermaid: true
keywords: [HNSW, IVF, product quantization, BM25, cosine, MRR, nDCG, Precision@k, Recall@k]
aliases: [ANN search, nearest neighbors, ranking metrics]
interview_queries: [why ranking matters in MRR, HNSW vs IVF, when to use nDCG rather than MRR]
references:
  - title: FAISS index selection
    url: https://github.com/facebookresearch/faiss/wiki/Guidelines-to-choose-an-index
  - title: pgvector filtering and iterative scans
    url: https://github.com/pgvector/pgvector#filtering
  - title: scikit-learn ranking metrics
    url: https://scikit-learn.org/stable/modules/model_evaluation.html
---
Retrieval has two distinct jobs: finding a broad enough set of relevant candidates and presenting the strongest evidence early. An index can be fast but omit relevant vectors; a reranker can improve the first result while discarding the second document needed for a multi-hop retrieval-augmented generation (RAG) answer. Measure these failures separately.

## From exact comparison to approximate search

For `N` vectors with `d` components, a brute-force dot-product scan performs work proportional to `N × d`. Approximate nearest-neighbor (ANN) structures avoid searching every point, usually at the cost of occasional missed exact neighbors.

**Hierarchical Navigable Small World (HNSW)** builds a navigable graph with sparse upper layers and a dense base layer. Search descends through the hierarchy toward closer candidates. `M` influences connectivity and memory, `efConstruction` affects index quality and build cost, and `efSearch` controls query-time exploration. Increasing `efSearch` often improves recall with additional latency; it does not require re-embedding.

**Inverted File (IVF)** search clusters vectors and probes a subset of partitions. Raising the number of probed lists commonly improves recall at additional cost. **Product quantization (PQ)** compresses representations using codebooks; it reduces memory and bandwidth while introducing approximation error.

| Index | Typical reason to choose it | Cost / risk |
|---|---|---|
| Exact flat | Ground-truth comparison, small corpora | Full-scan compute and memory bandwidth |
| HNSW | Low-latency high-recall interactive search | Graph memory and update/index overhead |
| IVF | Coarse partitioning of large vector sets | Index training and probing trade-offs |
| IVF + PQ | Tight memory budgets at large scale | Quantization can change ranking |

Use exact nearest-neighbor results on a representative sample to measure ANN recall. A good downstream answer score can hide search approximations that fail on rare queries.

### Filtering changes the candidate population

Suppose an approximate scan returns 50 nearby vectors and only two satisfy the tenant and effective-date filters. Applying those filters afterward leaves two results even if many other authorized passages exist farther down the search space.

{% capture filtered_search %}
flowchart TD
Q["Query plus tenant, date and source constraints"] --> S{"How selective is the allowed subset?"}
S -- "Small indexed subset" --> X["Filter then exact search"]
S -- "Broad subset" --> A["Filter-aware approximate search"]
S -- "Post-filtered ANN engine" --> O["Overfetch or supported iterative scan"]
O --> F["Apply authorization and revision filters"]
A --> V["Validate authorized result count and recall"]
X --> V
F --> V
V --> R["Rerank and assemble permitted evidence"]
{% endcapture %}
{% capture filtered_fallback %}
Choose exact search for a small filtered subset, filter-aware approximate search for a broad subset, or supported overfetch and iterative scanning when filters follow candidate search. Validate authorized result count and recall before reranking.
{% endcapture %}
{% include diagram.html title="Filtered retrieval needs enough eligible candidates" code=filtered_search fallback=filtered_fallback caption=true %}

Implementations differ in when they apply filters and how far they continue searching. pgvector documents iterative index scans for supported versions; these can scan further until enough matching rows are found or a configured limit is reached. Partitioning or partial indexes may help stable filter populations, while many tiny per-tenant indexes can become expensive to operate.

Authorization applies before evidence reaches the model or an answer cache. Index filtering needs a current permission source and invalidation behavior; a delayed permission update must not leave previously accessible passages exposed.

### Index recall and relevance recall use different ground truth

For an illustrative query, exact search returns ten nearest eligible vectors. An approximate index returns eight of those ten, giving ANN Recall@10 of 0.8. Human labels may identify only three of the ten exact neighbors as relevant. If there are six relevant passages in the permitted corpus, relevance Recall@10 for the exact result is 3/6 = 0.5. Improving the graph search cannot repair a representation that ranks irrelevant passages highly.

Compare exact and approximate search with the same filters, vector metric and corpus revision. Then evaluate labeled relevance and downstream evidence coverage separately.

## Cosine similarity and embedding compatibility

{% include math.html tex="\cos(a,b)=\frac{a\cdot b}{\|a\|\|b\|}" block=true %}

For unit-normalized vectors, cosine and dot product produce the same ranking. Query and document vectors must share a compatible learned representation. Identical dimensionality across independently trained models does not establish compatibility.

## Hybrid retrieval and fusion

BM25 rewards lexical matches using term frequency, document frequency and document-length normalization; it helps with identifiers, error messages and rare technical terms. Dense retrieval finds semantic neighbors when words differ. Hybrid search gathers both sets, then combines their order.

**Reciprocal Rank Fusion (RRF)** avoids adding incomparable BM25 and cosine scores:

{% include math.html tex="\mathrm{RRF}(d)=\sum_{r\in R}\frac{1}{k+\mathrm{rank}_r(d)}" block=true %}

A cross-encoder reranker evaluates the query and candidate text jointly. It can improve the final shortlist, but each candidate costs another inference pass. Candidate count, truncation and evidence diversity affect whether its gain is worth the latency.

### Inverted indexes and similarity thresholds

A lexical inverted index maps terms to posting lists of documents or passages, often with frequencies and positions used for ranking and phrase matching. A dense index organizes learned vectors. Hybrid retrieval can search both structures using the same document IDs and revisions.

A cosine score is a similarity measure under one encoder and preprocessing configuration. It is not a calibrated probability that the passage answers the question. A threshold that rejects irrelevant passages also rejects some useful evidence; tune it on labeled answerable and unanswerable queries, then re-evaluate after an encoder change.

## Ranking metrics describe different tasks

| Metric | What it rewards | Blind spot |
|---|---|---|
| Precision@k | Relevant share of the first k results | Relevant documents left elsewhere |
| Recall@k | Coverage of known relevant documents | Their order within the top k |
| Hit Rate@k | At least one relevant result returned | Missing other required evidence |
| Mean reciprocal rank (MRR) | First relevant result appears early | All later relevant results |
| Mean average precision (MAP) | Relevant results distributed high in ranking | Requires reliable relevance labels |
| Normalized discounted cumulative gain (nDCG) | Highly relevant items near the top, with graded labels | Doesn't prove all facts needed for an answer survived |

{% include math.html tex="\mathrm{MRR}=\frac{1}{Q}\sum_{i=1}^{Q}\frac{1}{r_i}" block=true %}

If the first relevant result appears at rank 1, its reciprocal rank is 1. At rank 4 it is 0.25; when no relevant result appears within the cutoff it contributes 0. A navigational search user benefits from an answer in position one, even when both systems contain the same relevant document farther down the list.

{% include math.html tex="\mathrm{DCG@k}=\sum_{i=1}^{k}\frac{2^{\mathrm{rel}_i}-1}{\log_2(i+1)},\quad \mathrm{nDCG@k}=\frac{\mathrm{DCG@k}}{\mathrm{IDCG@k}}" block=true %}

For example, three queries with first relevant hits at ranks 1, 4 and absent have MRR = (1 + 0.25 + 0)/3, approximately 0.417. If two systems put the first relevant hit at rank 1, MRR treats them equally even when only one retrieves the additional document needed to answer a comparison.

For a question requiring several documents, also evaluate **sufficient-evidence coverage**: whether every necessary fact survives candidate retrieval, reranking and context construction. A high MRR may coexist with an unusable final context.

See [stage-level RAG diagnostics]({{ '/ai-engineering/evaluation/evidence-survival-oracle-tests/' | relative_url }}) for locating the point where evidence disappears.
