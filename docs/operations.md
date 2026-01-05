# Operations

Use `/health/live` only to detect a running event loop. `/health/ready` exercises the persistence adapter and should gate traffic. SIGINT and SIGTERM stop accepting work, wait for Fastify to drain requests and force a non-zero exit if shutdown exceeds ten seconds.

Back up both the primary data file and its `.bak` sibling. Restore into a stopped process, validate JSON and start one replica. To bound analytics storage, run `npm exec tsx scripts/compact-analytics.ts -- <file> <days> <max-events>` against a stopped writer, then restart and verify readiness.

Alert on repeated `INTERNAL_ERROR`, readiness failures and sustained `429` responses. Request IDs are returned on every error for log correlation.
