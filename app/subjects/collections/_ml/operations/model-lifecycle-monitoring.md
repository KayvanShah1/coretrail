---
title: "Experiment tracking, model registries and release provenance"
description: "Connect training runs, evaluated artifacts and running deployments through immutable identities and retained release evidence."
chapter: operations
order: 1
sequence: 201
level: Core
mermaid: true
keywords: [MLOps, experiment tracking, MLflow, model registry, release manifest, model versioning, CI CD CT, champion challenger]
interview_queries: [explain a production ML pipeline, experiment tracker vs model registry, what should be versioned in MLOps]
last_verified: "2026-10-25"
references:
  - title: MLflow model registry workflows
    url: https://mlflow.org/docs/latest/ml/model-registry/workflow/
  - title: Google Cloud MLOps architecture
    url: https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning
---

A model score is reproducible only when the run identifies its source data, labels, fitted transformations, code, dependencies, seeds and configuration. A model's production behavior additionally depends on the release that loaded it and the live features supplied to it.

## Experiment, registry and deployment records

| Record | What it establishes | What it does not establish alone |
|---|---|---|
| Experiment run | Training inputs/configuration, metrics and generated artifacts | That the artifact passed a release gate or is currently serving |
| Registry version | Identified model artifact, metadata and links to evaluation evidence | Which version is loaded in every running replica |
| Release manifest | Image, resolved model, preprocessing, feature contract and configuration | That rollout completed or the service meets quality targets |
| Deployment observation | Loaded versions, ready replicas, rollout state and traffic assignment | That delayed predictive outcomes have improved |

Experiment trackers such as MLflow collect run parameters, metrics and artifacts. Registries organize identified model versions. Deployment controllers or serving platforms perform the actual loading, rollout and routing. Connect these records so “what changed?” can be answered from retained evidence.

{% capture diagram_code %}
flowchart TD
A["Versioned data and features"] --> B["Train and track"]
B --> C["Holdout evaluation"]
C --> D{"Release gate passes?"}
D -- "No" --> E["Retain rejected candidate"]
D -- "Yes" --> F["Register approved artifact"]
F --> G["Deploy resolved release"]
G --> H["Observe traffic and outcomes"]
{% endcapture %}
{% capture diagram_fallback %}
Versioned data and features produce a tracked training run and holdout evaluation. Failed candidates retain their evidence. Passing candidates become approved registry artifacts, enter a resolved deployment release, and are monitored on traffic and eventual outcomes.
{% endcapture %}
{% include diagram.html title="A trained artifact needs a separate release decision" code=diagram_code fallback=diagram_fallback caption=true %}

## Immutable versions and mutable aliases

MLflow supports immutable version identities and mutable aliases such as `champion`. An alias lets promotion choose a different version without renaming the logical model. Resolve the alias into the release record; record the concrete loaded version in serving telemetry. Changing an alias does not automatically replace models already held in server memory.

A usable release record includes the training run, source/feature/label snapshots, evaluation report and dataset version, artifact checksum, image digest, model signature, thresholds, configuration, approver or automated gate, and prior compatible release. Record actual rollout status separately from desired state.

A **champion** is the incumbent selected for use; a **challenger** is a candidate compared against it. These are roles, not guarantees of quality. A higher aggregate score can conceal a regression in a critical segment.

## CI, CD and continuous training

Continuous integration (CI) checks code, transformations, schemas and representative prediction behavior. Continuous delivery/deployment (CD) packages and promotes evaluated releases. Continuous training (CT) produces new candidate artifacts from approved data under a trigger policy. Training success is an input to promotion, not an approval by itself.

Use held-out quality and important slices alongside latency, startup, memory and compatibility checks. A shadow release scores copied traffic without exposing its decisions; suppress external side effects. A canary receives a controlled portion of real traffic, with predeclared acceptance and rollback conditions. With delayed outcomes, operational stability is available earlier than reliable predictive-quality evidence.

## Retain the evidence after release

Join predictions to eventual outcomes through stable prediction IDs, keeping event time, observation time, feature references and resolved release. Report label maturity and coverage. A seven-day quality dashboard based only on immediately resolved cases may misrepresent the deployed population.

In a fraud service, prediction `p901` made by release `r18` remains attached to that release even after `r19` becomes champion. Correcting the outcome updates outcome history; it should preserve which decision was made and what evidence was available at the time. Retention, access control and explanation requirements are developed in [observability, explainability, traceability and auditability]({{ '/infrastructure/observability/observability-explainability-traceability-auditability/' | relative_url }}).

Use [model deployment and serving]({{ '/ml/serving/model-deployment-serving/' | relative_url }}) for the artifact-to-endpoint sequence, [drift diagnosis]({{ '/ml/operations/drift-detection/' | relative_url }}) for statistical changes and [retraining triggers]({{ '/ml/operations/retraining-triggers/' | relative_url }}) for the guarded response loop.
