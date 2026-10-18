import { describe, expect, it } from "vitest";
import type { FastifyRequest } from "fastify";
import { clientKey } from "../src/http/client-key.js";

function request(forwarded?: string): FastifyRequest {
  return { ip: "127.0.0.1", headers: forwarded ? { "x-forwarded-for": forwarded } : {} } as FastifyRequest;
}

describe("trusted client keys", () => {
  it("ignores spoofed forwarding headers unless explicitly trusted", () => {
    expect(clientKey(request("203.0.113.5"), false)).toBe("127.0.0.1");
    expect(clientKey(request("203.0.113.5, 10.0.0.2"), true)).toBe("203.0.113.5");
  });
});
