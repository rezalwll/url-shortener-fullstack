# Edge Links

Edge Links is a small, production-minded Fastify service for durable short links. It preserves the useful behavior of the original URL-shortener prototype—creation, expiry, redirects, click counts and listing—while adding typed boundaries, atomic persistence, signed pagination, idempotent writes, rate limits and privacy-aware analytics.

## Run locally

```bash
npm ci
copy .env.example .env
npm run dev
```

The default API is `http://localhost:4000`. Data is stored in `data/edge-links.json`; each write uses a temporary file plus atomic rename and keeps one recovery snapshot.

## Quality gates

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run contract:export
```

The public surface is versioned under `/v1`. `contracts/operations.v1.json` guards reviewed operation IDs, while `contracts/openapi.v1.json` is the generated machine-readable contract.

## Service boundaries

- `src/application` owns link workflows and policy ordering.
- `src/domain` contains stable records, repository ports and error codes.
- `src/persistence` provides in-memory and durable atomic JSON adapters.
- `src/http` maps the domain to Fastify routes and OpenAPI.
- `src/rate-limit` contains a clock-injected sliding-window limiter.

See `docs/architecture.md` for the dependency direction and `docs/operations.md` for recovery and shutdown procedures.
