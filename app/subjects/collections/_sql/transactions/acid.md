---
title: "ACID, commits & savepoints"
description: "Group related changes so failure does not leave partial work."
chapter: "transactions"
order: 1
sequence: 1001
level: "Core"
references: [{"title":"PostgreSQL transactions tutorial","url":"https://www.postgresql.org/docs/current/tutorial-transactions.html"}]
---

## Four properties

| Property | Meaning |
|---|---|
| Atomicity | The transaction's changes commit together or are rolled back |
| Consistency | Defined invariants remain satisfied when the application and constraints are correct |
| Isolation | Concurrent transactions interact according to the chosen isolation level |
| Durability | A successful commit persists according to the database's durability configuration |

Consistency does not mean the database automatically knows every business rule. If a transfer credits one account without debiting another and no rule detects it, a transaction can commit the wrong business operation.

## Transfer as one unit

```sql
BEGIN;
UPDATE accounts SET balance = balance - 25 WHERE account_id = 1;
UPDATE accounts SET balance = balance + 25 WHERE account_id = 2;
COMMIT;
```

Assume both accounts exist and the balance rules allow the transfer. The application must check affected rows and handle errors. Transactions protect atomicity, not the correctness of missing predicates or IDs.

## Save part of the work

```sql
BEGIN;
UPDATE accounts SET balance = balance + 10 WHERE account_id = 1;
SAVEPOINT before_optional_change;
UPDATE accounts SET balance = balance + 5 WHERE account_id = 2;
ROLLBACK TO SAVEPOINT before_optional_change;
COMMIT;
```

Only the first increment remains. A savepoint is a rollback boundary within a transaction, not a separately durable nested commit.

## Interview check

An error can leave a PostgreSQL transaction in an aborted state until rollback or rollback to a suitable savepoint. Keep transactions short, and do not hold database locks while waiting for a user or a slow external service.

For workload categories and cross-system effects, see [ACID, OLTP/OLAP/HTAP, outbox and distributed coordination]({{ '/data-engineering/modelling/transactions-acid-consistency/' | relative_url }}).
