import request from "supertest";
import app from "../src/app";
import prisma from "../src/prisma";

describe("URL API", () => {
  beforeEach(async () => {
    await prisma.url.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates a short URL", async () => {
    const res = await request(app)
      .post("/api/urls")
      .send({ originalUrl: "https://example.com" })
      .expect(201);

    expect(res.body.shortCode).toBeDefined();
    expect(res.body.shortUrl).toContain("/r/");
    expect(res.body.clicks).toBe(0);
  });

  it("redirects and increments clicks", async () => {
    const createRes = await request(app)
      .post("/api/urls")
      .send({ originalUrl: "https://example.com/page" })
      .expect(201);

    const code = createRes.body.shortCode;

    await request(app).get(`/r/${code}`).redirects(0).expect(302);

    const updated = await prisma.url.findUnique({ where: { shortCode: code } });
    expect(updated?.clicks).toBe(1);
  });

  it("lists URLs sorted by createdAt desc", async () => {
    const first = await request(app)
      .post("/api/urls")
      .send({ originalUrl: "https://first.com" })
      .expect(201);

    const second = await request(app)
      .post("/api/urls")
      .send({ originalUrl: "https://second.com" })
      .expect(201);

    const listRes = await request(app).get("/api/urls").expect(200);
    const codes = listRes.body.map((u: any) => u.shortCode);

    expect(codes[0]).toBe(second.body.shortCode);
    expect(codes[1]).toBe(first.body.shortCode);
  });
});
