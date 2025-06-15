import type { FastifyInstance } from "fastify";
import { LinkService } from "../application/link-service.js";
import { clientKey } from "./client-key.js";

export function registerRedirectRoutes(app: FastifyInstance, service: LinkService, trustProxy: boolean): void {
  app.get<{ Params: { slug: string } }>("/r/:slug", {
    schema: {
      operationId: "followLink", tags: ["redirects"], summary: "Resolve a short link and record an anonymized visit",
      params: { type: "object", required: ["slug"], properties: { slug: { type: "string" } }, additionalProperties: false },
      response: { 302: { type: "null" }, 404: { type: "object" }, 410: { type: "object" } }
    }
  }, async (request, reply) => {
    const link = await service.resolve(request.params.slug, {
      clientKey: clientKey(request, trustProxy),
      referrer: request.headers.referer
    });
    return reply.header("cache-control", "private, no-store").redirect(link.target, 302);
  });
}
