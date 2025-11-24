import { Router } from "express";
import { listUrls, createShortUrl } from "../services/urlService";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { originalUrl, expiresAt } = req.body ?? {};
    const created = await createShortUrl({ originalUrl, expiresAt });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    const urls = await listUrls();
    res.json(urls);
  } catch (err) {
    next(err);
  }
});

export default router;
