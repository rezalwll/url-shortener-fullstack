# url-shortener-fullstack

Monorepo for a simple URL shortener with click tracking.

- **server/**: Express + TypeScript + Prisma (SQLite) API and redirect service.
- **client/**: Next.js + TypeScript + Tailwind dashboard UI.
- Defaults: API at `http://localhost:4000`, frontend at `http://localhost:3000`.

## Quickstart

```bash
# install deps
cd server && npm install
cd ../client && npm install
```

### Server

```bash
cd server
# set your DB URL (optional, defaults to file:./prisma/dev.db)
set DATABASE_URL=file:./prisma/dev.db   # PowerShell example
# run migrations (creates the schema)
npm run prisma:migrate
# dev server
npm run dev
# build + start
npm run build && npm start
```

Health check: `GET http://localhost:4000/health`

CORS: allows `http://localhost:3000` by default.

### Client

```bash
cd client
npm run dev        # http://localhost:3000
npm run build
npm start
```

## API

Base URL: `http://localhost:4000`

- `POST /api/urls`
  - Body: `{ "originalUrl": string, "expiresAt"?: string | null }`
  - Returns: `{ id, originalUrl, shortCode, shortUrl, clicks, createdAt, expiresAt }`
- `GET /api/urls`
  - Returns list sorted by `createdAt` desc.
- `GET /r/:code`
  - 302 redirect to `originalUrl` if found and not expired.
  - 404 if not found, 410 if expired.

Short URLs are shaped as `{BASE_URL}/r/{shortCode}` with `BASE_URL` defaulting to `http://localhost:4000`.

## Testing (server)

```bash
cd server
npm test
```

`pretest` runs `prisma db push --force-reset` against `file:./prisma/test.db`. Ensure `DATABASE_URL` is set if you prefer a different path.

## Project structure

```
server/
  src/           # Express app, routes, services
  prisma/        # Prisma schema
  test/          # Vitest + Supertest integration tests
client/
  app/           # Next.js app router pages
  components/    # UI components
```
