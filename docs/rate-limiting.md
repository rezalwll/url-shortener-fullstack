# Rate limiting

Link creation uses an in-process sliding window. Each accepted attempt consumes one slot; rejected attempts do not extend the window. Responses publish limit, remaining and reset epoch headers. A rejected request returns `429` and a rounded-up `Retry-After` value.

The clock is injected, making window edges deterministic in tests. Keys are isolated per client. This implementation is deliberately local to one process; a distributed deployment must replace the limiter with a shared atomic counter while preserving the `RateLimiter` contract.

Redirects are not limited by the creation budget because availability and abuse controls have different traffic profiles.
