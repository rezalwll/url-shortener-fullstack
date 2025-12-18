# API v1

`POST /v1/links` accepts a target, optional custom slug and optional future expiry. A client may send `Idempotency-Key`; replaying the same payload returns `200` with `Idempotency-Replayed: true`, while reusing the key for another payload returns `409`.

`GET /v1/links` uses an HMAC-signed cursor. Cursors are opaque and tied to both creation time and identifier so equal timestamps remain stable.

`GET /v1/links/:slug` reads metadata, `DELETE /v1/links/:slug` disables future redirects, and `GET /v1/links/:slug/stats` returns aggregate visits. `GET /r/:slug` returns a non-cacheable `302`, `404` for unknown aliases and `410` for disabled or expired links.

Errors share `{ error, message, requestId, details? }`. Error codes are stable within v1 even when human-readable messages improve.
