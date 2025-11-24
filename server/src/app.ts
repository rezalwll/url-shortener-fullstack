import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/errorHandler";
import urlRoutes from "./routes/urlRoutes";
import redirectRoutes from "./routes/redirectRoutes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/urls", urlRoutes);
app.use("/r", redirectRoutes);

app.use(errorHandler);

export default app;
