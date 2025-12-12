# Architecture

Edge Links uses ports and adapters so HTTP, persistence and time are replaceable in tests. Route handlers validate the wire format and pass a client key to `LinkService`. The service normalizes destinations, applies rate and idempotency policies, then talks only to `LinkRepository`. Both repository adapters implement the same concurrency and ordering contract.

```text
Fastify routes -> LinkService -> LinkRepository
       |              |              |
   JSON Schema   URL/slug policy   memory/file
       |              |
    OpenAPI      clock + limiter
```

The redirect path increments analytics before returning a `302`, so a successful response means the visit reached durable storage. A failed persistence write therefore fails closed rather than silently losing a click.

Trade-off: atomic JSON is intentionally single-process. It is dependable for a compact service and easy to inspect, but horizontal scaling requires replacing the repository adapter with a transactional database.
