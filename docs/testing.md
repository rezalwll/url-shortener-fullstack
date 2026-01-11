# Testing strategy

Pure policies use table-driven unit tests. Repositories share behavioral expectations around ordering, conflicts and click increments. Fastify integration tests use `inject`, so they exercise serialization, schemas, headers and error mapping without binding a port.

Contract tests compare generated OpenAPI operation IDs with the reviewed v1 list. The fixture matrix adds security and boundary cases as data, keeping each scenario reviewable. Temporary directories isolate durability, corruption-recovery and concurrency tests.

Run the full local gate with `npm run check`. A clean contract export must leave `contracts/openapi.v1.json` unchanged.
