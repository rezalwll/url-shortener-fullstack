# Persistence and recovery

The durable adapter stores a versioned document with links, anonymized visit events and idempotency records. Mutations are serialized by an async mutex. A write creates a mode-`0600` temporary file, copies the previous primary to `.bak`, then atomically renames the temporary file.

On startup, a missing primary is treated as an empty store. A corrupt primary is recovered from the backup; if both documents are invalid, readiness fails and the process does not invent data.

Only one process may write a data file. For multiple replicas, implement `LinkRepository` with a database that provides unique slug constraints and transactions around click increments.
