---
title: "Tokenization, logits, sampling and generation behavior"
description: "Understand token boundaries, next-token distributions, temperature, top-k, nucleus sampling and decoding cost."
chapter: inference
order: 8
sequence: 108
level: Intermediate
math: true
keywords: [BPE, WordPiece, SentencePiece, tokenization, logits, temperature, top p, top k, greedy decoding, beam search]
aliases: [LLM decoding strategies, tokenization fundamentals]
interview_queries: [how does temperature change LLM output, what is top p sampling, why are some languages more token expensive]
---
A language model predicts distributions over its tokenizer's vocabulary. The tokenizer determines which sequences of bytes or characters become model input IDs, and decoding determines which candidate token the application emits at each step. Prompt length, output length and vocabulary segmentation affect both model behavior and serving cost.

## Tokenization is a learned segmentation

Byte Pair Encoding (BPE) iteratively learns common symbol merges and typically represents text as a mix of word fragments and longer frequent units. WordPiece and unigram tokenization learn alternative subword segmentations; SentencePiece is a toolkit supporting several approaches. Byte-level schemes can represent previously unseen strings through smaller pieces.

A token rarely equals a word. Identifiers, rare product codes, non-English scripts, whitespace and punctuation may be split into multiple tokens. This affects embedding input limits, truncation, billing and latency. Count tokens with the specific model's tokenizer; the same words can produce different counts across vocabularies.

Tokenizers often include reserved markers for beginning/end of sequences or special message roles. Changing the tokenizer can invalidate input-ID assumptions and require compatible model weights; two models trained on different vocabularies cannot exchange raw token IDs safely.

## From hidden state to probability

The final transformer representation produces a vector of vocabulary **logits**. Softmax converts logits into a probability distribution. Temperature rescales their relative gaps:

{% include math.html tex="P_i(T)=\frac{\exp(z_i/T)}{\sum_j\exp(z_j/T)}" block=true %}

For positive temperature T, smaller values concentrate probability on the largest logits. Higher values flatten the distribution, increasing sampling diversity. Very low temperature does not guarantee factuality, nor does higher temperature directly increase model knowledge.

**Greedy decoding** picks the highest-probability token at each step. It is fast and repeatable under controlled conditions but can become trapped in locally likely continuations.

**Top-k sampling** restricts candidates to the k highest-scoring tokens, renormalizing their probabilities. **Nucleus/top-p sampling** keeps the smallest highest-ranked candidate set whose cumulative probability reaches a chosen threshold, adapting candidate count to distribution sharpness. These filters can be combined in some runtimes.

**Beam search** tracks several partial sequences and uses aggregate scores to choose among them; it may be useful for constrained sequence-to-sequence generation, but can make open-ended responses repetitive and costs more than one active path. Length penalties and termination rules affect comparisons.

## Serving implications

A generation request spends prefill compute on the prompt and repeated decode work on each emitted token. The key-value (KV) cache retains prior attention keys and values. Setting a high maximum output-token count reserves potential work even when most requests stop early; schedulers need realistic length distributions.

Stop conditions include end-of-sequence tokens, application-defined stop sequences, token budgets and tool-call handoffs. JSON-schema constrained decoding may mask invalid next tokens. It increases format reliability when supported, but does not validate the truth of field values or authorize tools.

For regression tests, compare validity, task correctness, token length, deterministic checks and latency across decoding configurations. Fix random seeds only as far as the provider/runtime allows; batching, floating-point execution and model revisions can still change exact text. Statistical quality across cases is more meaningful than requiring identical natural-language responses.

[Transformer attention and adaptation]({{ '/ai-engineering/inference/transformers-embeddings-adaptation/' | relative_url }}) supplies the model mechanism, and [prefill, decode and KV cache]({{ '/ai-engineering/inference/prefill-decode-kv-cache/' | relative_url }}) explains serving constraints.
