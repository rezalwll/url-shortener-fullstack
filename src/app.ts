import Fastify, { type FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import type { AppConfig } from "./config.js";
import type { LinkRepository } from "./domain/repository.js";
import type { Clock } from "./lib/clock.js";
import { systemClock } from "./lib/clock.js";
import { FileLinkRepository } from "./persistence/file-link-repository.js";
import { SlidingWindowRateLimiter } from "./rate-limit/sliding-window.js";
import { LinkService } from "./application/link-service.js";
import { registerErrorHandler } from "./http/errors.js";
import { registerSecurityHeaders } from "./http/security.js";
import { registerHealthRoutes } from "./http/health.js";
import { registerLinkRoutes } from "./http/links.js";
import { registerRedirectRoutes } from "./http/redirects.js";

export interface BuildAppOptions {
  readonly config: AppConfig;
  readonly repository?: LinkRepository;
  readonly clock?: Clock;
  readonly slugFactory?: () => string;
  readonly idFactory?: () => string;
  readonly logger?: boolean;
}

export async function buildApp(options: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: options.logger ?? false, trustProxy: false });
  const repository = options.repository ?? new FileLinkRepository(options.config.dataFile);
  const clock = options.clock ?? systemClock;
  const service = new LinkService({
    repository,
    clock,
    rateLimiter: new SlidingWindowRateLimiter(options.config.rateLimitMax, options.config.rateLimitWindowMs, clock),
    publicBaseUrl: options.config.publicBaseUrl,
    cursorSecret: options.config.cursorSecret,
    visitorSalt: options.config.visitorSalt,
    slugFactory: options.slugFactory,
    idFactory: options.idFactory
  });
  await app.register(swagger, {
    openapi: {
      info: { title: "Edge Links API", version: "1.0.0", description: "Durable, rate-limited short links with privacy-aware analytics." },
      servers: [{ url: options.config.publicBaseUrl }]
    }
  });
  registerSecurityHeaders(app);
  registerErrorHandler(app);
  registerHealthRoutes(app, repository);
  registerLinkRoutes(app, service, options.config.trustProxy);
  registerRedirectRoutes(app, service, options.config.trustProxy);
  await app.ready();
  return app;
}
