import type { FastifyInstance } from "fastify";
import { DomainError } from "../domain/errors.js";

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((caught, request, reply) => {
    if (caught instanceof DomainError) {
      if (caught.code === "RATE_LIMITED" && typeof caught.details?.resetAt === "number") {
        reply.header("retry-after", Math.max(1, Math.ceil((caught.details.resetAt - Date.now()) / 1000)));
      }
      return reply.status(caught.statusCode).send({
        error: caught.code,
        message: caught.message,
        requestId: request.id,
        ...(caught.details ? { details: caught.details } : {})
      });
    }
    if (typeof caught === "object" && caught !== null && "validation" in caught && caught.validation) {
      const message = "message" in caught && typeof caught.message === "string"
        ? caught.message
        : "request validation failed";
      return reply.status(400).send({ error: "VALIDATION_ERROR", message, requestId: request.id });
    }
    request.log.error({ err: caught }, "unhandled request error");
    return reply.status(500).send({ error: "INTERNAL_ERROR", message: "unexpected service error", requestId: request.id });
  });
}
