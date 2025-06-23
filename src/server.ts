import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";

const config = loadConfig();
const app = await buildApp({ config, logger: true });

await app.listen({ host: config.host, port: config.port });

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => void app.close().finally(() => process.exit(0)));
}
