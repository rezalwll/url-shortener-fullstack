import type { FastifyInstance } from "fastify";
import type { CreateLinkInput } from "../domain/link.js";
import type { LinkService } from "../application/link-service.js";
import { clientKey } from "./client-key.js";
import { schemas } from "./schemas.js";

interface SlugParams { slug: string }
interface ListQuery { limit?: number; cursor?: string }
interface CreateHeaders { "idempotency-key"?: string }

export function registerLinkRoutes(app: FastifyInstance, service: LinkService, trustProxy: boolean): void {
  app.post<{ Body: CreateLinkInput; Headers: CreateHeaders }>("/v1/links", {
    schema: {
      operationId: "createLink", tags: ["links"], summary: "Create a durable short link",
      headers: { type: "object", properties: { "idempotency-key": { type: "string", minLength: 8, maxLength: 128 } } },
      body: schemas.createBody,
      response: { 200: schemas.link, 201: schemas.link, 400: schemas.error, 409: schemas.error, 429: schemas.error }
    }
  }, async (request, reply) => {
    const result = await service.create(request.body, {
      clientKey: clientKey(request, trustProxy),
      idempotencyKey: request.headers["idempotency-key"]
    });
    reply.header("x-ratelimit-limit", result.rateLimit.limit);
    reply.header("x-ratelimit-remaining", result.rateLimit.remaining);
    reply.header("x-ratelimit-reset", Math.ceil(result.rateLimit.resetAt / 1000));
    if (result.replayed) reply.header("idempotency-replayed", "true");
    return reply.status(result.replayed ? 200 : 201).send(result.link);
  });

  app.get<{ Querystring: ListQuery }>("/v1/links", {
    schema: {
      operationId: "listLinks", tags: ["links"], summary: "List links with a signed cursor",
      querystring: { type: "object", properties: { limit: { type: "integer", minimum: 1, maximum: 100, default: 20 }, cursor: { type: "string" } } },
      response: { 200: schemas.listResponse, 400: schemas.error }
    }
  }, (request) => service.list(request.query.limit ?? 20, request.query.cursor));

  app.get<{ Params: SlugParams }>("/v1/links/:slug", {
    schema: { operationId: "getLink", tags: ["links"], params: { type: "object", required: ["slug"], properties: { slug: { type: "string" } } }, response: { 200: schemas.link, 404: schemas.error } }
  }, (request) => service.get(request.params.slug));

  app.delete<{ Params: SlugParams }>("/v1/links/:slug", {
    schema: { operationId: "disableLink", tags: ["links"], params: { type: "object", required: ["slug"], properties: { slug: { type: "string" } } }, response: { 200: schemas.link, 404: schemas.error } }
  }, (request) => service.disable(request.params.slug));

  app.get<{ Params: SlugParams }>("/v1/links/:slug/stats", {
    schema: { operationId: "getLinkStats", tags: ["analytics"], params: { type: "object", required: ["slug"], properties: { slug: { type: "string" } } }, response: { 200: schemas.statsResponse, 404: schemas.error } }
  }, (request) => service.stats(request.params.slug));
}
