---
title: "Images, containers, and registries"
description: "Understand what gets built, stored, pulled, and executed when an application is containerized."
chapter: containers
order: 1
sequence: 101
level: Core
keywords:
  - Docker image
  - container
  - image registry
  - container registry
  - OCI
aliases:
  - image vs container
tools:
  - Docker
  - Docker Hub
interview_queries:
  - what is the difference between an image and a container
  - what is a container registry
references:
  - title: Docker overview
    url: https://docs.docker.com/get-started/docker-overview/
  - title: Docker - What is a registry?
    url: https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-registry/
  - title: Docker - Build, tag, and publish an image
    url: https://docs.docker.com/get-started/docker-concepts/building-images/build-tag-and-publish-an-image/
---

An **image** is the packaged filesystem and metadata used to start a process environment. A **container** is a running instance created from that image.

A **registry** distributes images between build systems and machines that need to run them.

## The lifecycle

1. Build an image from a Dockerfile and build context.
2. Push the versioned image to a registry.
3. Pull that image onto the execution host.
4. Let the container runtime create and run an instance from it.

If ten replicas use the same image, you do not have ten different source artifacts. You have ten running instances derived from a versioned image.

## What belongs in the image?

Usually:

```text
application binary/code
runtime dependencies
system libraries
startup command
configuration defaults
```

Secrets and environment-specific configuration generally should not be permanently baked into the image.

Large mutable data also deserves separate treatment. A large language model (LLM) checkpoint, for example, can be mounted or downloaded independently rather than forcing every code change to rebuild a huge image.

## Tags are convenient; digests are precise

An image tag such as `my-app:1.4` is human-friendly and can be moved depending on registry policy.

A content digest identifies an exact image manifest/content.

For reproducible production deployment, know which exact artifact ran, not only which friendly tag someone intended to use.

## Registry versus repository

A registry is the service storing/distributing images. Inside it, repositories group related images/tags.

Examples include Docker Hub and cloud/vendor registries.

The practical reason a registry exists is that the machine running a workload should not need your source tree and local build environment. It needs a known image artifact it can pull and execute.

## Containerization solves consistency, not orchestration

Docker does not inherently decide:

- which machine should run the workload;
- how many replicas you need;
- how traffic reaches them;
- what happens if a machine dies.

That is where an orchestrator such as Kubernetes enters.

For graphics processing unit (GPU) workloads, one more interface matters: the image contains userspace libraries, but the physical GPU and kernel driver belong to the host. Continue to [How containers use GPUs]({{ '/infrastructure/containers/gpu-containers/' | relative_url }}).
