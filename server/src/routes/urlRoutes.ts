import { Router } from "express";
import { createShortUrl } from "../services/urlService";

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

export default router;
