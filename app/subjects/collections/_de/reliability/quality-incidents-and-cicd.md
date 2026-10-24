---
title: "Data pipeline CI/CD and release validation"
description: "Test transformation semantics, compatibility, replay and publication before promoting a data release."
chapter: reliability
order: 1
sequence: 701
level: Core
keywords: [data pipeline CI/CD, integration tests, release validation, data repair, canary data, candidate tables]
interview_queries: [what should a data pipeline CI test, why is code rollback insufficient for a data release]
references:
  - title: dbt model contracts
    url: https://docs.getdbt.com/docs/mesh/govern/model-contracts
  - title: Airflow best practices and testing
    url: https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html
---

A code change can pass a small transformation test and still alter a published table's grain, history or delete behavior. A pipeline release must validate its output contract as well as the program.

## Choose checks that expose the change

| Check | Example failure it can expose |
|---|---|
| Parsing and type fixtures | An empty string becomes zero instead of null |
| Grain and relationship checks | A dimension join duplicates one fact |
| Temporal fixtures | A record at a version boundary matches both historical rows |
| Incremental versus full-build comparison | A delete or late correction is missing from the incremental output |
| Repeat-run test | The same logical input is appended twice |
| Integration test with the actual connector | A cursor, schema or transaction assumption differs from the local fixture |
| Representative execution trial | A changed join creates an unacceptable shuffle or memory requirement |

Choose expected rows and totals independently of the transformation being tested. Include missing keys, duplicate source changes, reordered revisions and empty input where those cases are valid. Tiny fixtures prove semantics; they cannot establish production throughput or concurrency behavior.

[Schema contracts and migrations]({{ '/data-engineering/reliability/schema-evolution-and-contracts/' | relative_url }}) explains structural compatibility. [Diagnostic examples]({{ '/data-engineering/reliability/diagnosis-symptoms-evidence/' | relative_url }}) show the grain and reconciliation checks.

## Validate a candidate before publication

Build a candidate table or bounded output using pinned input and code versions. Compare expected key coverage, delete state and business totals against a trusted release or independent calculation. Examine subgroup differences so an unchanged total cannot conceal offsetting errors.

A shadow run processes production-shaped input into isolated outputs. A canary limits the affected consumers or data scope. Both need duplicate external effects suppressed and an explicit promotion condition.

Version code, SQL, schemas, model configuration and the release's source coverage. Record which tables and consumers a change affects. The [publication lifecycle]({{ '/data-engineering/foundations/pipeline-run-lifecycle/' | relative_url }}) explains how compatible snapshots become consumer-ready.

## Roll back code and repair data deliberately

Rolling back a deployment changes future execution. It does not reverse already committed rows or restore deleted source history.

Stop or fence a faulty writer, establish the affected coverage, choose a trusted version and rebuild or correct the output. Reconcile that correction before exposing it. The [recovery reference]({{ '/data-engineering/reliability/recovery-replay-backfills/' | relative_url }}) supplies the replay and backfill procedure.

Release identities should have only the permissions required to create or promote the intended output. Keep secrets outside source code and preserve the evidence required to explain who published a release.
