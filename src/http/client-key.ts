import type { FastifyRequest } from "fastify";

function firstForwarded(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const candidate = raw?.split(",")[0]?.trim();
  return candidate && candidate.length <= 64 ? candidate : null;
}

export function clientKey(request: FastifyRequest, trustProxy: boolean): string {
  if (!trustProxy) return request.ip;
  return firstForwarded(request.headers["x-forwarded-for"]) ?? request.ip;
}
