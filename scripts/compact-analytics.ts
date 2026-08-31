import { readFile, writeFile } from "node:fs/promises";
import { compactEvents } from "../src/analytics/compact-events.js";
import { validateState } from "../src/persistence/state.js";

const file = process.argv[2];
if (!file) throw new Error("Usage: tsx scripts/compact-analytics.ts <state-file> [days] [max-events]");
const days = Number(process.argv[3] ?? 90);
const maximum = Number(process.argv[4] ?? 100_000);
const cutoff = new Date(Date.now() - days * 86_400_000);
const current = validateState(JSON.parse(await readFile(file, "utf8")) as unknown);
const result = compactEvents(current, cutoff, maximum);
await writeFile(file, `${JSON.stringify(result.state, null, 2)}\n`);
process.stdout.write(`${JSON.stringify({ removed: result.removed, retained: result.state.events.length })}\n`);
