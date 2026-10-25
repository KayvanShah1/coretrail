---
title: "Choosing prompting, RAG, SFT and preference tuning"
description: "Match missing knowledge, task behavior, preference quality and inference cost to the intervention that can change them."
chapter: inference
order: 10
sequence: 110
level: Core
keywords: [supervised fine tuning, SFT, DPO, RLHF, preference tuning, distillation, RAG vs fine tuning, LoRA, QLoRA, catastrophic forgetting]
interview_queries: [when should you fine tune instead of RAG, SFT vs DPO, how do you create fine tuning data, how do you evaluate a fine tuned model]
last_verified: "2026-10-25"
references:
  - title: Hugging Face supervised fine-tuning trainer
    url: https://huggingface.co/docs/trl/en/sft_trainer
  - title: Hugging Face direct preference optimization trainer
    url: https://huggingface.co/docs/trl/en/dpo_trainer
  - title: Direct Preference Optimization paper
    url: https://arxiv.org/abs/2305.18290
  - title: LoRA paper
    url: https://arxiv.org/abs/2106.09685
---

A model that misses a current policy, emits the wrong schema and produces verbose answers has three different failure modes. Training more parameters is an expensive way to investigate which one matters.

## Match the intervention to the gap

| Evidence | Intervention to evaluate | What it changes |
|---|---|---|
| The task or expected format is underspecified | Clear instructions, examples and an output contract | Information supplied at inference time |
| Needed facts change or require access control and citations | Retrieval-augmented generation (RAG) or a verified tool lookup | Evidence available for this request |
| Repeated task behavior remains poor despite a clear prompt and adequate evidence | Supervised fine-tuning (SFT) | Learned behavior from input/desired-output demonstrations |
| Several plausible answers exist but preferences are inconsistent | Preference tuning, including Direct Preference Optimization (DPO) | Relative preference between chosen and rejected outputs |
| A larger model works but exceeds serving cost or latency limits | Distillation into a smaller model | Student behavior learned from teacher outputs or distributions |

Retrieval and adaptation can coexist. A fine-tuned support model can still need retrieval for the latest policy. Fine-tuning also does not grant permission to a tool or replace application authorization.

## Supervised fine-tuning uses demonstrations

An SFT dataset pairs task inputs with desired completions or conversations. Quality comes from correct examples, representative difficult cases, consistent formatting and coverage of the intended workload. Repeating many near-identical easy examples can inflate apparent progress without improving the failure slice.

A tool-use example should include the correct tool schema, arguments and observed result where the task requires them. Use the serving chat template consistently, decide which tokens contribute to the loss, and confirm that truncation preserves the supervised answer. Padding, end-of-sequence handling and assistant-only masking can materially change what training learns.

Keep train and evaluation data separated by the source/entity/time boundaries relevant to the task. Near-duplicate documents or paraphrased copies can leak across a random split. Retain a frozen regression set covering ordinary tasks, abstention, tool failures and permission constraints. [Evaluation datasets and contamination]({{ '/ai-engineering/evaluation/golden-datasets-contamination/' | relative_url }}) owns those controls.

## Preference tuning learns a comparison

A preference example contains a prompt and a chosen/rejected answer pair. The preference needs a stated rubric: correctness, supported claims, concision, policy compliance or another task-specific criterion. If the chosen response merely has more words, the model may learn length instead of the intended quality.

DPO optimizes a preference objective relative to a reference policy without requiring a separately trained reward model and the same online reinforcement-learning loop used in common reinforcement learning from human feedback (RLHF) setups. It still needs reliable preference data, regularization choices and evaluation. A contaminated or weak judge can propagate systematic preferences into the model.

SFT can first teach the task's response pattern, followed by preference tuning when relative quality remains the problem. That sequence is a design choice to test, not a mandatory recipe. Distillation can use a teacher to generate demonstrations, but teacher mistakes and unsupported claims must be filtered or measured.

## Parameter-efficient tuning changes the resource budget

Low-Rank Adaptation (LoRA) trains small updates over a frozen base; Quantized LoRA (QLoRA) reduces frozen-base storage precision during training. They change parameter and memory requirements, not whether task data and evaluation are necessary. [Attention, embeddings and adaptation mechanics]({{ '/ai-engineering/inference/transformers-embeddings-adaptation/' | relative_url }}) owns the equations and parameter counts.

Pin the base revision, tokenizer/template, adapter, training configuration and data version. An adapter trained for one base revision is not automatically compatible with another. A merged checkpoint and a dynamically loaded adapter also have different serving and rollback paths; see [multi-model serving]({{ '/ml/serving/multi-model-serving/' | relative_url }}).

## Prove improvement before promotion

Compare the base, prompted baseline and candidate on the same held-out tasks. Track the targeted failure, general capability regressions, memorization/disclosure risk, refusal behavior, latency, memory and cost. Better training loss does not establish better task success. A narrow adaptation can reduce previously useful behavior, often described as catastrophic forgetting.

For a policy assistant, measure current-fact retrieval separately from answer format and preference quality. If retrieval supplies the wrong policy revision, adaptation can make the wrong answer more consistent. Diagnose the failing stage, then use the [AI release gates]({{ '/ai-engineering/evaluation/metrics-release-gates/' | relative_url }}) before deploying the chosen intervention.
