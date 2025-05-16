const link = {
  type: "object",
  required: ["id", "slug", "target", "shortUrl", "createdAt", "expiresAt", "disabledAt", "clicks", "lastVisitedAt", "version"],
  properties: {
    id: { type: "string", format: "uuid" },
    slug: { type: "string", minLength: 4, maxLength: 48 },
    target: { type: "string", format: "uri" },
    shortUrl: { type: "string", format: "uri" },
    createdAt: { type: "string", format: "date-time" },
    expiresAt: { anyOf: [{ type: "string", format: "date-time" }, { type: "null" }] },
    disabledAt: { anyOf: [{ type: "string", format: "date-time" }, { type: "null" }] },
    clicks: { type: "integer", minimum: 0 },
    lastVisitedAt: { anyOf: [{ type: "string", format: "date-time" }, { type: "null" }] },
    version: { type: "integer", minimum: 1 }
  }
} as const;

const error = {
  type: "object",
  required: ["error", "message", "requestId"],
  properties: {
    error: { type: "string" },
    message: { type: "string" },
    requestId: { type: "string" },
    details: { type: "object", additionalProperties: true }
  }
} as const;

export const schemas = {
  link,
  error,
  createBody: {
    type: "object",
    additionalProperties: false,
    required: ["target"],
    properties: {
      target: { type: "string", minLength: 1, maxLength: 4096 },
      customSlug: { type: "string", minLength: 4, maxLength: 48 },
      expiresAt: { anyOf: [{ type: "string", format: "date-time" }, { type: "null" }] }
    }
  },
  listResponse: {
    type: "object",
    required: ["items", "nextCursor"],
    properties: {
      items: { type: "array", items: link },
      nextCursor: { anyOf: [{ type: "string" }, { type: "null" }] }
    }
  },
  statsResponse: {
    type: "object",
    required: ["linkId", "clicks", "uniqueVisitors", "referrers"],
    properties: {
      linkId: { type: "string", format: "uuid" },
      clicks: { type: "integer", minimum: 0 },
      uniqueVisitors: { type: "integer", minimum: 0 },
      referrers: {
        type: "array",
        items: {
          type: "object",
          required: ["host", "clicks"],
          properties: { host: { type: "string" }, clicks: { type: "integer", minimum: 1 } }
        }
      }
    }
  }
} as const;
