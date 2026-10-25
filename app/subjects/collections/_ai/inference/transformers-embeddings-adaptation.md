---
title: "Transformer attention, embeddings and fine-tuning"
description: "Derive scaled attention and contrastive retrieval objectives, then compare LoRA, QLoRA and full adaptation."
chapter: inference
order: 7
sequence: 107
level: Core
math: true
keywords: [transformer, self attention, RoPE, contextual embedding, contrastive loss, LoRA, QLoRA, DPO]
interview_queries: [how does attention work mathematically, why rerank with cross encoders, LoRA vs QLoRA]
---

Transformers repeatedly combine information between token positions through attention and feed-forward layers. A decoder-only large language model (LLM) uses causal attention to generate one new token position at a time. Retrieval encoders are often trained for a different objective: placing related texts near one another in a vector space.

## Query, key and value projections

Given input representations `X`, learned matrices produce queries, keys and values:

{% include math.html tex="Q=XW_Q,\quad K=XW_K,\quad V=XW_V" block=true %}
{% capture attention %}
\operatorname{Attention}(Q,K,V)=\operatorname{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V
{% endcapture %}
{% include math.html tex=attention block=true %}

The query-key product scores interactions between positions. Scaling by the square root of key dimension reduces excessively large logits; softmax turns scores into weights for combining value vectors. Causal masking prevents a decoder position from using future positions.

Separate projections create multiple attention heads. Positional information handles sequence order; rotary positional embeddings (RoPE) rotate query and key components according to position. Full attention compares all pairs of positions, so its score matrix grows quadratically with sequence length.

FlashAttention improves attention-kernel memory I/O and avoids materializing the full score matrix in high-bandwidth memory. A key-value (KV) cache stores prior attention state during autoregressive decoding. These techniques address different costs.

## Static and contextual embeddings

Word2Vec and GloVe learn static word vectors; FastText uses character n-grams to represent subword information. Contextual encoders such as BERT produce representations that depend on the sentence, so the word 'bank' can change meaning with surrounding text.

For semantic retrieval, a **bi-encoder** embeds the query and documents separately. Documents can be precomputed and indexed. A **cross-encoder** processes the query and document together, usually improving relevance decisions while requiring inference for each candidate pair.

A contrastive retrieval loss can compare a positive document with negative candidates:

{% capture contrastive %}
\mathcal{L}=-\log\frac{\exp(s(q,d^+)/\tau)}{\sum_j\exp(s(q,d_j)/\tau)}
{% endcapture %}
{% include math.html tex=contrastive block=true %}

The temperature `τ` controls the distribution sharpness. Hard negatives resembling correct answers make the training signal more demanding, but mislabeled negatives can damage retrieval quality.

## Autoregressive pretraining

Decoder-only language models usually minimize next-token negative log-likelihood:

{% include math.html tex="\mathcal{L}=-\sum_{t=1}^{T}\log p_\theta(x_t\mid x_{<t})" block=true %}

At inference, temperature, top-k and nucleus (top-p) sampling control token selection. A low temperature reduces sampling randomness without proving factual correctness.

BERT-style encoders suit many representation and token-labeling tasks, decoder-only models suit generation, and encoder-decoder architectures such as T5 handle sequence-to-sequence mappings with cross-attention.

## Parameter-efficient adaptation

Full fine-tuning updates pretrained parameters and requires substantial gradient and optimizer memory. Low-Rank Adaptation (LoRA) freezes the base weight matrix and learns a low-rank update:

{% include math.html tex="W'=W+BA,\quad B\in\mathbb{R}^{d\times r},\; A\in\mathbb{R}^{r\times k}" block=true %}

For a {% include math.html tex="d\times k" %} matrix, LoRA trains roughly {% include math.html tex="r(d+k)" %} parameters instead of {% include math.html tex="dk" %} when the rank {% include math.html tex="r" %} is much smaller than both dimensions. Quantized LoRA (QLoRA) stores the frozen base model in a reduced-precision representation to lower training memory further.

Supervised fine-tuning (SFT) trains against demonstrations. Direct Preference Optimization (DPO) uses preference pairs to shift behavior relative to a reference policy. Distillation trains a smaller student using a teacher's outputs or probability distributions.

Retrieval-augmented generation (RAG) supplies changing knowledge and provenance at inference time. Adaptation changes learned behavior. A specialized fine-tuned model may still need retrieval for current or access-controlled facts.

For serving cost, continue with [prefill, decode and KV cache]({{ '/ai-engineering/inference/prefill-decode-kv-cache/' | relative_url }}).
