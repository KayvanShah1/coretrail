---
title: "Vector indexes, ranking and retrieval metrics"
description: "Compare exact search, HNSW, IVF, BM25, reciprocal rank fusion, reranking and the metrics suited to each retrieval task."
chapter: retrieval
order: 3
sequence: 603
level: Core
math: true
keywords: [HNSW, IVF, product quantization, BM25, cosine, MRR, nDCG, Precision@k, Recall@k]
aliases: [ANN search, nearest neighbors, ranking metrics]
interview_queries: [why ranking matters in MRR, HNSW vs IVF, when to use nDCG rather than MRR]
references:
  - title: FAISS index selection
    url: https://github.com/facebookresearch/faiss/wiki/Guidelines-to-choose-an-index
  - title: scikit-learn ranking metrics
    url: https://scikit-learn.org/stable/modules/model_evaluation.html
---
Retrieval has two distinct jobs: finding a broad enough set of relevant candidates and presenting the strongest evidence early. An index can be fast but omit relevant vectors; a reranker can improve the first result while discarding the second document needed for a multi-hop answer. Measure these failures separately.

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

## Cosine similarity and embedding compatibility

{% include math.html tex="\cos(a,b)=\frac{a\cdot b}{\|a\|\|b\|}" block=true %}

For unit-normalized vectors, cosine and dot product produce the same ranking. Query and document vectors must share a compatible learned representation. Identical dimensionality across independently trained models does not establish compatibility.

## Hybrid retrieval and fusion

BM25 rewards lexical matches using term frequency, document frequency and document-length normalization; it helps with identifiers, error messages and rare technical terms. Dense retrieval finds semantic neighbors when words differ. Hybrid search gathers both sets, then combines their order.

**Reciprocal Rank Fusion (RRF)** avoids adding incomparable BM25 and cosine scores:

{% include math.html tex="\mathrm{RRF}(d)=\sum_{r\in R}\frac{1}{k+\mathrm{rank}_r(d)}" block=true %}

A cross-encoder reranker evaluates the query and candidate text jointly. It can improve the final shortlist, but each candidate costs another inference pass. Candidate count, truncation and evidence diversity affect whether its gain is worth the latency.

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

For a question requiring several documents, also evaluate **sufficient-evidence coverage**: whether every necessary fact survives candidate retrieval, reranking and context construction. A high MRR may coexist with an unusable final context.

See [stage-level RAG diagnostics]({{ '/ai-engineering/evaluation/evidence-survival-oracle-tests/' | relative_url }}) for locating the point where evidence disappears.
