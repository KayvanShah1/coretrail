---
title: "Dockerfiles, image builds and isolated execution"
description: "Understand build layers, dependency control, resource limits and the limits of container isolation for model and coding-agent workloads."
chapter: containers
order: 3
sequence: 103
level: Core
keywords: [Dockerfile, multi stage build, docker layers, reproducible build, container sandbox, resource limits]
interview_queries: [image vs container, why use multi-stage Docker builds, is Docker a secure sandbox]
---

A container image packages an application filesystem and startup configuration. A container starts a process from that image, usually sharing the host operating system kernel. A virtual machine ordinarily runs a separate guest kernel, which changes isolation and startup costs.

## Why layer order affects the build

Dockerfile instructions create cached build layers. Copying frequently modified source files before dependency installation invalidates cache unnecessarily. Copy stable dependency manifests first, install dependencies, then copy application code.

```dockerfile
FROM python:3.12-slim AS runtime
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app/ ./app/
USER 10001
CMD ["python", "-m", "app.server"]
```

Production images should pin dependencies, provide the required non-root filesystem permissions and avoid embedding secrets. Multi-stage builds can compile dependencies in a builder stage while copying only necessary runtime artifacts into the final image. Pinning an immutable image digest makes the deployed artifact identifiable.

Large model weights can live in an image, object storage or a mounted model cache. Downloading on startup increases cold-start latency and network demand; packaging weights in every image increases image distribution cost. Cache invalidation and weight-version tracking matter either way.

## Resource controls and untrusted code

Linux namespaces isolate selected process views, while control groups (cgroups) account for and constrain resource consumption. A container is not inherently a strong hostile-code sandbox. Generated code may still abuse kernel interfaces, open outbound connections or consume resources if execution policies allow it.

For coding-agent evaluation, record a repository revision, dependency lock, deterministic test command and time limit. Apply network restrictions, filesystem permissions, central processing unit (CPU)/memory limits, dropped capabilities and a suitable sandboxing profile. Stronger isolation mechanisms or dedicated workers may be required for adversarial code.

A reproducible image removes many environmental differences, but flaky tests, external services and nondeterministic timing can still make results vary.

## Containers versus orchestration

An image registry distributes immutable artifacts. Docker or another runtime creates the process. Kubernetes schedules Pods, handles replica declarations, service discovery and rollout. None of these automatically provides graphics processing unit (GPU) model batching or efficient key-value cache management; the inference engine owns those decisions.

For the model-specific startup sequence, see [large language model (LLM) startup lifecycle]({{ '/ai-engineering/deployment/startup-lifecycle/' | relative_url }}).
