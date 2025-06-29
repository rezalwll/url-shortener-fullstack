import { writeFile } from "node:fs/promises";
import { buildApp } from "../src/app.js";
import { loadConfig } from "../src/config.js";

const app = await buildApp({ config: loadConfig(), logger: false });
const document = app.swagger();
await writeFile(new URL("../contracts/openapi.v1.json", import.meta.url), `${JSON.stringify(document, null, 2)}\n`);
await app.close();
