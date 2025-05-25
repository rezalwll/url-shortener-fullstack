import type { FastifyRequest } from "fastify";

export function clientKey(request: FastifyRequest, _trustProxy: boolean): string {
  return request.ip;
}
