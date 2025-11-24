import express from "express";
import urlRoutes from "./routes/urlRoutes";

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/urls", urlRoutes);

export default app;
