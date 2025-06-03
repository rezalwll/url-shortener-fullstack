import type { FastifyInstance } from "fastify";
import type { LinkRepository } from "../domain/repository.js";

export function registerHealthRoutes(app: FastifyInstance, repository: LinkRepository): void {
  app.get("/health/live", {
    schema: { hide: true, response: { 200: { type: "object", required: ["status"], properties: { status: { const: "ok" } } } } }
  }, async () => ({ status: "ok" }));

  app.get("/health/ready", {
    schema: { hide: true, response: { 200: { type: "object", required: ["status"], properties: { status: { const: "ready" } } }, 503: { type: "object" } } }
  }, async (_request, reply) => {
    const ready = await repository.ready();
    return ready ? { status: "ready" } : reply.status(503).send({ status: "unavailable" });
  });
}
