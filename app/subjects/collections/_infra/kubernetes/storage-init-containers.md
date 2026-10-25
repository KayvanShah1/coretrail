---
title: "Storage and init containers"
description: "Use volumes for data whose lifecycle differs from a container and init containers for setup that must finish before the application starts."
chapter: kubernetes
order: 3
sequence: 203
level: Core
keywords:
  - PersistentVolume
  - PVC
  - volume mount
  - init container
  - shared volume
aliases:
  - Kubernetes storage
  - initialization container
tools:
  - Kubernetes
interview_queries:
  - what is an init container
  - how do pods access persistent storage
  - how do you download a model before the main container starts
references:
  - title: Kubernetes Init Containers
    url: https://kubernetes.io/docs/concepts/workloads/pods/init-containers/
  - title: Kubernetes Volumes
    url: https://kubernetes.io/docs/concepts/storage/volumes/
---

Container filesystems work well for packaged software and temporary runtime state. Persistent application data needs a storage lifecycle that can outlive an individual container or Pod.

## Volumes give containers another storage lifecycle

A Pod can mount volumes into one or more containers.

Depending on the volume type, the data may be:

- ephemeral for the Pod;
- backed by node-local storage;
- backed by a PersistentVolume;
- provided by a network or cloud storage system;
- generated from configuration/secrets.

The design question is: **what should survive container replacement, and where should the authoritative copy live?**

## Persistent storage separates capacity from the Pod

Kubernetes uses three related objects for persistent storage:

- a **PersistentVolume (PV)** represents storage capacity available to the cluster;
- a **PersistentVolumeClaim (PVC)** is a workload's request for persistent storage;
- a **StorageClass** describes a class of storage and can drive dynamic provisioning.

A Pod normally mounts the claim, not a cloud disk directly:

The Pod specification references a PersistentVolumeClaim (PVC). The claim binds to a PersistentVolume (PV), which represents storage such as a disk or network filesystem.

The exact provisioning path depends on the storage driver, but the Pod consumes a claim while the storage resource can have a different lifecycle.

## Init containers run before the app containers

Kubernetes init containers run to completion during Pod initialization. Each configured init container must succeed before the next one and before the normal application containers start.

This fits setup work that has to finish before the application starts, such as:

```text
fetch artifact
verify checksum
render configuration
wait for dependency
prepare shared volume
```

For a large language model (LLM) deployment:

An init container downloads and verifies the model checkpoint into a shared volume. The vLLM application container then mounts that volume to load the prepared files.

The serving process does not need to own every model-distribution concern.

## Init containers are for ordered setup

If the main application can safely load its own immutable artifact, another container can add lifecycle and debugging complexity. Init containers make sense when setup has to complete first or when download, verification, and application startup need different responsibilities.

## Persistent volume does not guarantee fast startup

A model available through shared storage may avoid a remote internet download while still being slower to read than local non-volatile memory express (NVMe) storage. Several replicas starting at once can also contend for storage bandwidth.

Storage location, caching, and startup time are separate measurements.

Next: [Startup, readiness, liveness, and rollouts]({{ '/infrastructure/kubernetes/probes-rollouts/' | relative_url }}).
