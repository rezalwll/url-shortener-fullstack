import { buildApp } from "./app.js";
import { loadConfig } from "./config.js";
import { installGracefulShutdown } from "./lifecycle/graceful-shutdown.js";

const config = loadConfig();
const app = await buildApp({ config, logger: true });

await app.listen({ host: config.host, port: config.port });
installGracefulShutdown(app);
