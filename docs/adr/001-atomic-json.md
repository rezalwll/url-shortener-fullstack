# ADR 001: atomic JSON for the first durable adapter

Status: accepted.

We need persistence that is inspectable, testable and deployable without a database service. A versioned JSON document with serialized updates and atomic rename meets that scope. It also makes corruption and recovery tests deterministic.

We accept single-process writes and whole-document serialization. The domain depends on `LinkRepository`, so moving to SQLite or PostgreSQL does not change route or application contracts. The migration trigger is sustained write contention or a need for multiple replicas.
