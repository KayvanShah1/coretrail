---
title: "Reconciliation, schema drift, incident recovery, and CI/CD"
description: "Restore trustworthy data and identify the layer responsible for production regressions."
chapter: reliability
order: 1
sequence: 701
level: Core
keywords:
  - Reconciliation, schema drift, incident recovery, and CI/CD
interview_queries:
  - explain reconciliation, schema drift, incident recovery, and ci/cd
---

A data-quality contract describes the expected population, grain, key uniqueness, validity, completeness, consistency and freshness. A green job can still publish revenue twice if a join multiplies records.

## Reconcile meaningful properties

Two tables can have identical row counts and entirely different keys. Reconcile source versus target key coverage, delete state, totals by stable partition, update versions and sampled values. Agree on units, currency precision, timestamp interpretation and null handling before comparing measures.

Schema drift can be additive, such as a new nullable field, or breaking, such as an amount arriving as the string NA. Safe casting prevents some crashes but can silently turn valid business values into nulls. Retain raw input, quarantine or classify invalid records, and monitor the invalid-rate trend. For ownership, compatibility policies and downstream migrations, see [Schema evolution and data contracts]({{ '/data-engineering/reliability/schema-evolution-and-contracts/' | relative_url }}).

## Incident investigation

A pipeline previously taking twenty minutes now needs two hours. Break the duration into extraction, queueing, compute, retries and destination writes. Spark provides skew, shuffle and spill diagnostics. BigQuery provides stages, scanned bytes and slot use. Dataflow exposes worker throughput, backlog and watermark lag.

A separate problem occurs when incorrect records have already been published. Isolate the writer, determine the affected time range and consumers, restore a compatible processing version, rebuild from trusted source data, and reconcile corrected output before resuming. Rolling back code does not reverse committed table mutations.

## Release and cost discipline

Version SQL, Python, schemas, infrastructure and service configuration. Test transformations, connector behavior, schema compatibility, idempotency, and representative end-to-end samples. Deploy with least-privilege identities and controlled secrets. Plan both application rollback and data repair.

For cost, attribute bills to workloads before reducing capacity. Repeated warehouse scans, idle processing workers, storage retention and cross-region transfers have different remedies.
