---
title: "NLP preprocessing, representations and entity resolution"
description: "Connect tokenization, sparse features, contextual embeddings and entity extraction to concrete retrieval and agent failures."
chapter: inference
order: 9
sequence: 109
level: Core
keywords: [NLP, stemming, lemmatization, stopwords, TF-IDF, bag of words, n-grams, NER, entity linking, sentence embeddings, pooling]
aliases: [natural language processing basics, text preprocessing, named entity recognition]
interview_queries: [stemming vs lemmatization, TF-IDF vs embeddings, why BERT needs pooling for retrieval]
references:
  - title: Hugging Face tokenization course
    url: https://huggingface.co/learn/llm-course/en/chapter6/1
  - title: scikit-learn text feature extraction
    url: https://scikit-learn.org/stable/modules/feature_extraction.html#text-feature-extraction
  - title: Sentence Transformers semantic similarity
    url: https://sbert.net/docs/sentence_transformer/usage/semantic_textual_similarity.html
---

Natural language processing (NLP) turns text into representations that support tasks such as classification, extraction, retrieval and generation. A retrieval-augmented generation (RAG) application can fail before any agent chooses a tool: preprocessing may remove a negation, an entity name may map to the wrong record, or an encoder may truncate the sentence containing the answer.

## Text preparation changes meaning

**Tokenization** divides text into the units a model or search analyzer consumes. Word-based search analyzers and subword model tokenizers can produce different units for the same string. **Normalization** applies a defined transformation, such as Unicode normalization or case folding. Its rules should match the task: lowercasing ordinary prose may be acceptable while changing a case-sensitive identifier can break an exact lookup.

**Stemming** uses rules to reduce word forms, sometimes producing fragments. **Lemmatization** maps inflected forms to dictionary forms using linguistic information. Either can help a lexical search pipeline group variants, but a pretrained encoder expects the input conventions used during training. Aggressive preprocessing can discard information the encoder could have used.

Stopword removal needs the same care. Removing "not" from "the vehicle is not insured" reverses a business condition. Removing units, dates or punctuation can change "1.5 MW", "15 MW" and a versioned product code. Preserve original source text and citation offsets alongside any normalized search field.

| Operation | Where it can help | Failure to check |
|---|---|---|
| Case and Unicode normalization | Alias matching and lexical lookup | Altered identifiers or lost distinctions |
| Stemming / lemmatization | Matching inflected words in lexical indexes | Collapsed terms with different meanings |
| Stopword filtering | Reducing common terms in selected sparse pipelines | Lost negation, phrases or domain terms |
| Word n-grams | Representing phrases such as "credit risk" | Larger sparse vocabulary |
| Character n-grams | Spelling variants and partial names | False matches between similar identifiers |

## Sparse features retain lexical evidence

A **bag-of-words** representation counts vocabulary terms and largely discards order. Word n-grams restore some local phrase information. **Term frequency–inverse document frequency (TF-IDF)** weights terms using their within-document frequency and rarity across the fitted corpus. Fitting the vocabulary and frequency statistics on the training split prevents evaluation data from influencing a supervised text experiment.

Sparse features are inexpensive baselines for text classification and exact-term matching. Their dimensions correspond to vocabulary items; a new synonym can remain unrelated to a known word. A character-based representation can handle some unseen spellings but increases feature count.

BM25 is a lexical ranking function with term-frequency saturation and document-length normalization. Its score and a dense encoder's cosine similarity have different scales, which is why hybrid retrieval often fuses ranks. See [vector search and ranking]({{ '/ai-engineering/retrieval/vector-search-ranking/' | relative_url }}).

## Token embeddings and sentence embeddings

Static word vectors assign a word a learned representation largely independent of the surrounding sentence. Contextual models change token representations with context: "bank" in a river description and "bank" in a credit report can produce different hidden states.

An encoder typically produces a representation for each token. Retrieval needs a comparable vector for the query or passage. Pooling combines token states, for example by an attention-mask-aware mean or a designated classification token. The pooling method, normalization and training objective affect sentence similarity. Taking an arbitrary pretrained model's first token is a baseline that needs evaluation; a sentence encoder trained on relevant pairs directly optimizes this use.

For each encoder, check input length and truncation, language coverage, query/document prefixes or task modes, and the prescribed pooling configuration. Those choices belong in the [embedding release manifest]({{ '/ai-engineering/retrieval/embedding-index-migrations/' | relative_url }}).

## Extraction and record identity

**Named entity recognition (NER)** identifies spans and categories such as organizations, places or dates. **Entity linking** resolves a mention to a specific record. A model can correctly recognize "Springfield" as a place while linking it to the wrong city. **Coreference resolution** connects mentions such as "the supplier" or "it" to an earlier entity.

An agent that receives "show the cheaper one in that city" must recover both references, update typed constraints and resolve the canonical city ID before calling search. An alias table can map alternate spellings to that ID. Ambiguous names need additional evidence or clarification; high vector similarity alone cannot establish identity.

Evaluate each stage against its own output: span/type precision and recall for NER, correct record IDs for linking, retained negation and units for preprocessing, and relevant-evidence recall for retrieval. Successful text generation can conceal an earlier identity mistake.

The [tokenization and decoding page]({{ '/ai-engineering/inference/tokenizers-decoding-sampling/' | relative_url }}) explains model input IDs and sampling. [Transformer attention and adaptation]({{ '/ai-engineering/inference/transformers-embeddings-adaptation/' | relative_url }}) covers the learned representations.
