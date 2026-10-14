---
title: "Containers"
nav_title: "Overview"
description: "Follow packaged software from an image registry into a running container before adding orchestration."
chapter: containers
order: 0
sequence: 100
level: "Chapter overview"
keywords:
  - container image
  - container runtime
  - registry
  - Docker
aliases:
  - containerization
tools:
  - Docker
interview_queries:
  - what problem do containers solve
  - image vs container
references:
  - title: Docker overview
    url: https://docs.docker.com/get-started/docker-overview/
---

A container is a process environment started from an image and isolated with operating-system mechanisms while still sharing the host kernel.

The practical questions are: **what is packaged, where is it stored, what starts the process, and which host resources can it access?**

## In this chapter

<ul class="topic-list">
<li><a href="{{ '/infrastructure/containers/images-containers-registries/' | relative_url }}">Images, containers, and registries</a><span>Separate the immutable package from the running process and the place images are distributed from.</span></li>
<li><a href="{{ '/infrastructure/containers/gpu-containers/' | relative_url }}">How containers use GPUs</a><span>Follow graphics processing unit (GPU) access through host drivers, container libraries, device exposure, and accelerator scheduling.</span></li>
<li><a href="{{ '/infrastructure/containers/docker-build-isolation/' | relative_url }}">Dockerfiles, image builds and isolated execution</a><span>Build reproducible artifacts and control risks when executing untrusted code.</span></li>
</ul>
