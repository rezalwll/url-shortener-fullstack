import { Router } from "express";
import { resolveAndTrack } from "../services/urlService";

const router = Router();

router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const record = await resolveAndTrack(code);
    return res.redirect(302, record.originalUrl);
  } catch (err) {
    next(err);
  }
});

export default router;
