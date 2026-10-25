---
title: "From trained model to prediction service"
description: "Package preprocessing and model artifacts, choose batch or online execution, and follow a request through a reproducible release."
chapter: serving
order: 2
sequence: 102
level: Core
block_diagrams: true
keywords: [model deployment, model serving, batch inference, online inference, asynchronous inference, model signature, container image, artifact download, init container]
interview_queries: [how is a machine learning model deployed, can a container run without model weights in its image, batch vs online inference]
last_verified: "2026-10-25"
references:
  - title: Google Cloud MLOps architecture
    url: https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning
  - title: MLflow model signatures
    url: https://mlflow.org/docs/latest/ml/model/signatures/
  - title: scikit-learn model persistence
    url: https://scikit-learn.org/stable/model_persistence.html
  - title: Kubernetes init containers
    url: https://kubernetes.io/docs/concepts/workloads/pods/init-containers/
  - title: Hugging Face revision-pinned downloads
    url: https://huggingface.co/docs/huggingface_hub/en/guides/download
---

A training job produces an artifact. A deployment makes a tested prediction pipeline available to consumers under a latency, capacity and failure contract. Copying a notebook's serialized estimator into an HTTP handler leaves several parts of that contract undefined.

## Choose how predictions reach the consumer

| Execution mode | Example | What the service must preserve |
|---|---|---|
| Batch | Score every account before 06:00 | Input snapshot, completion deadline, restartable partitions and output publication |
| Synchronous online | Score an incoming transaction within 100 ms | Bounded request latency, fresh features and enough ready capacity |
| Asynchronous online | Process an uploaded document taking several minutes | Durable job ID, progress/result storage, retries and cancellation |
| Edge or embedded | Run a small classifier on a device | Compatible runtime, limited resources and controlled artifact updates |

These are workload choices. A daily forecast can use a containerized batch job without a permanently running endpoint. An asynchronous endpoint still needs a durable queue and result contract; returning HTTP 202 alone does not supply them.

## Package the complete prediction function

Version the estimator together with fitted encoders, imputers, feature order, expected types, units, output schema, threshold or calibration state, and required runtime dependencies. A model signature documents the input/output contract; semantic checks still need to detect mistakes such as cents supplied to a model trained on dollars.

Fit transformations using training data, then reuse those fitted transformations at inference. Refitting an encoder on each request changes the meaning of the model's inputs. When an online feature store supplies inputs, record the feature definition and freshness contract as well as the model version. See [point-in-time feature construction]({{ '/ml/features/point-in-time-features/' | relative_url }}).

Serialization also affects deployment. A Python pickle-style artifact can execute code while loading and depends on compatible libraries. Load trusted artifacts in a tested environment. An interchange format such as ONNX can reduce Python dependencies when the model and operators are supported, but conversion needs numerical and task-level parity tests.

## Release identity connects software and artifacts

{% include block-diagram.html id="model-release-serving" %}

The release manifest binds an immutable image digest, model version/checksum, preprocessing version and runtime configuration. A registry alias such as `champion` helps select a version for promotion; resolve and record its concrete version for the release. Repeated alias lookups by different replicas can otherwise produce an unexplained mixture of versions.

A release proceeds through artifact validation, representative prediction tests, placement, loading and warmup. Readiness succeeds after the intended version can answer a representative request. A canary then compares operational and predictive behavior against the incumbent. Keep the previous compatible release available for rollback.

## Build an image without including the model

The image can contain only the server, dependencies and artifact-loading client. This example assumes a project with a `serving` Python package and a fully pinned, hash-locked dependency file:

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.lock ./
RUN pip install --no-cache-dir --require-hashes -r requirements.lock
COPY serving/ ./serving/
ENV MODEL_ROOT=/models
USER 10001:10001
ENTRYPOINT ["python", "-m", "serving"]
```

No model file is copied during the build. Pin the base image by digest in a reproducible release, create a writable model volume with the correct ownership, and configure the artifact identity at deployment. The `serving` package is application code, not a Python standard-library server.

At startup, either the serving process downloads the artifact before becoming ready, or an init container downloads it into a volume mounted read-only by the server. Kubernetes runs ordinary init containers to completion before starting application containers. The two patterns share an artifact contract:

1. Read a pinned model revision and trusted manifest using runtime credentials.
2. Fetch into a temporary directory on the destination volume. Bound retries and download time.
3. Verify the expected files, sizes and checksums; check format/runtime compatibility.
4. Publish the completed directory atomically on that filesystem, then load from that versioned path.
5. Warm up, verify the loaded version and enable readiness. A failed or partial download leaves readiness false.

For a Hugging Face repository, `snapshot_download(repo_id=..., revision=..., local_dir=...)` can fetch a specified revision into a directory. Use an immutable commit revision for a release, then perform the manifest checks above. The download helper alone does not implement the whole publication protocol. A shared cache additionally needs coordination so concurrent replicas cannot observe an unfinished directory.

Runtime identity or a mounted secret supplies access; credentials do not belong in an image layer. A persistent cache reduces repeated transfer, while ephemeral storage may require downloading again after replacement. For large language model (LLM) checkpoints, [weight placement and GPU loading]({{ '/ai-engineering/deployment/model-weights/' | relative_url }}) explain the additional memory and startup costs.

## Follow one prediction

A fraud service release `r18` binds model `42`, feature definition `7`, preprocessing `5` and threshold `0.72`. Request `p901` authenticates, validates its input, fetches timestamped features, executes the pipeline and returns a score plus decision. Its retained prediction record identifies the resolved release, event time, feature snapshot/reference and threshold. The later confirmed outcome joins through `p901`; it does not overwrite which model made the original decision.

The request handler should reuse a loaded model. Loading per request adds latency and can create concurrent memory spikes. Additional server workers can each hold another model copy, so worker count belongs in capacity planning. [Multi-model placement]({{ '/ml/serving/multi-model-serving/' | relative_url }}) covers copies, groups and isolation.
