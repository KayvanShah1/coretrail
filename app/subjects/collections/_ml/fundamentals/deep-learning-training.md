---
title: "Neural-network optimization and architecture choices"
description: "Review backpropagation, gradient descent, regularization, CNNs, RNNs, embeddings and when deep learning is justified."
chapter: fundamentals
order: 6
sequence: 56
level: Intermediate
math: true
keywords: [backpropagation, SGD, Adam, gradient descent, batch normalization, dropout, CNN, RNN, vanishing gradient, early stopping]
aliases: [deep learning fundamentals, neural networks training]
interview_queries: [how does backpropagation work, why LSTM rather than RNN, what is overfitting in deep learning]
---
A neural network composes learned transformations so that a loss calculated at the output can update representations throughout the model. Whether it improves a problem depends on the structure in the input and the amount of reliable data. A boosted tree often remains a stronger and cheaper baseline for ordinary tabular data.

## Forward pass and backpropagation

A dense layer maps inputs {% include math.html tex="x" %} through weights and a nonlinear activation:

{% include math.html tex="h=\phi(Wx+b),\qquad \hat y=f_\theta(x)" block=true %}

A loss quantifies discrepancy between target and prediction. Backpropagation applies the chain rule, propagating derivatives from the output toward earlier layers. A stochastic gradient descent (SGD) update is:

{% include math.html tex="\theta_{t+1}=\theta_t-\eta\nabla_\theta\mathcal L(\theta_t)" block=true %}

The learning rate {% include math.html tex="\eta" %} controls update size. Too large can cause unstable loss; too small can make convergence extremely slow. Momentum and Adam adapt the update dynamics; adaptive optimization still requires learning-rate and regularization decisions.

ReLU retains positive values and clips negative ones; GELU smoothly gates activations and is common in Transformers. Sigmoid and tanh can saturate, reducing gradient magnitudes. Softmax converts a set of logits into a categorical distribution. Choose the output activation and loss together: sigmoid with binary cross-entropy for a binary target, or logits with a numerically stable multiclass cross-entropy implementation.

Mini-batches trade gradient noise against throughput and memory. Gradient accumulation simulates a larger effective batch across multiple small steps without holding the entire batch's activations simultaneously.

## Vanishing gradients and sequence modeling

Repeated chain-rule multiplication through long recurrent sequences can make gradients vanish or explode. Long Short-Term Memory (LSTM) gates and residual connections address different versions of information/gradient flow. Gradient clipping limits unusually large updates but does not restore information already lost from a truncated sequence.

A recurrent neural network (RNN) processes observations in order and naturally represents temporal state. A convolutional neural network (CNN) applies shared filters to local spatial or temporal neighborhoods. Transformers use attention across positions and suit many text and long-range dependency tasks, though the computational profile differs.

| Architecture | Natural inductive bias | Typical trade-off |
|---|---|---|
| Multilayer perceptron (MLP) | Fixed-length numerical vectors | Requires input feature construction |
| CNN / temporal convolution | Local patterns and translation-like invariance | Receptive field and boundary choices |
| RNN / LSTM | Ordered sequential state | Limited parallelism across sequence steps |
| Transformer | Content-dependent interactions across positions | Attention, memory and data complexity |
| Gradient-boosted trees | Structured feature splits | Temporal and spatial structure often engineered |

## Regularization and diagnosis

L1 regularization penalizes absolute coefficient magnitudes and can encourage sparsity. L2 regularization penalizes squared magnitudes. Weight decay directly shrinks weights during optimization; its relationship to an L2 penalty depends on the optimizer. Dropout randomly omits activations during training and can reduce co-adaptation. Early stopping halts training when validation performance stops improving. Data augmentation adds plausible variants only when it preserves the target.

Batch normalization uses training-batch statistics and maintained running estimates; small batches or distribution changes can cause instability. Layer normalization works within token/feature representations and is common in Transformers. Neither normalization mechanism guarantees generalization by itself.

Training loss falling while validation loss rises suggests overfitting, data shift or a mismatch between samples. Inspect data quality, entity leakage, label errors, class imbalance, learning curves and task-specific validation before expanding the network.

For [Transformer attention and adaptation]({{ '/ai-engineering/inference/transformers-embeddings-adaptation/' | relative_url }}) see the AI Engineering trail; for [XGBoost and survival modeling]({{ '/ml/fundamentals/xgboost-lstm-survival/' | relative_url }}) compare the model families on event-time tasks.
