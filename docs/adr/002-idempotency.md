# ADR 002: durable idempotency for link creation

Status: accepted.

Clients retry writes after network failures and must not create duplicate links. The API accepts a bounded idempotency key and stores its payload fingerprint with the created link identifier. The same key and payload replay the original resource; a different payload returns a conflict.

Records live in the persistence boundary so restarts preserve behavior. A future database adapter should enforce key uniqueness and link creation in one transaction.
