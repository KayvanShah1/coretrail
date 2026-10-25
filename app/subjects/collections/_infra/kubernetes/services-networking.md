---
title: "Kubernetes Services and networking"
nav_title: "Services & networking"
description: "Understand why Pods need stable service discovery and how cluster and external traffic reach changing backends."
chapter: kubernetes
order: 2
sequence: 202
level: Core
keywords:
  - Kubernetes Service
  - ClusterIP
  - LoadBalancer
  - Gateway API
  - EndpointSlice
  - pod IP
aliases:
  - service discovery
tools:
  - Kubernetes
interview_queries:
  - why do you need a Kubernetes Service
  - how does traffic reach Kubernetes pods
references:
  - title: Kubernetes Services, Load Balancing, and Networking
    url: https://kubernetes.io/docs/concepts/services-networking/
  - title: Connecting Applications with Services
    url: https://kubernetes.io/docs/tutorials/services/connect-applications-service/
---

Pods are replaceable, and their Internet Protocol (IP) addresses can change across restarts and rollouts. A Kubernetes **Service** gives a changing set of backend Pods a stable network identity.

## Pod addresses are not the service contract

A Deployment can remove one Pod and create another. The new Pod can have a different IP.

If callers were configured directly against Pod IPs, normal rollout and failure recovery would break their routing assumptions.

A Service selects eligible backends and provides a stable name/address over that changing set.

## The flow

A client can enter through an external load balancer or Gateway. For Service routing, the cluster uses backend information from EndpointSlices to select an eligible Pod. The exact forwarding mechanism depends on the cluster networking implementation.

Readiness matters here. A Pod that exists but is not ready should not be treated like a healthy backend for ordinary Service traffic.

## Internal traffic uses service discovery

Inside the cluster, a Service gets a stable virtual address and Domain Name System (DNS) name. A `ClusterIP` Service is the common internal form: callers target the Service while Kubernetes tracks the ready Pod endpoints behind it through EndpointSlices.

For traffic entering the cluster, common options include:

- a `LoadBalancer` Service backed by cloud infrastructure;
- Gateway API implementations;
- Ingress in existing deployments.

The exact path depends on the environment:

`external edge → cluster service/routing → ready Pod`.

## Kubernetes networking also controls reachability

The cluster network gives Pods routable addresses, while NetworkPolicy can restrict which Pods or namespaces may communicate when the network implementation supports it.

Kubernetes updates endpoint membership as Pods appear, disappear, or fail readiness. Applications can keep calling the stable Service while the backend set changes underneath it.

Next: [Storage and init containers]({{ '/infrastructure/kubernetes/storage-init-containers/' | relative_url }}).
