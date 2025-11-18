import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AtomicJsonStore } from "../src/persistence/atomic-json-store.js";

describe("atomic store recovery", () => {
  it("falls back to the last backup when the primary is corrupt", async () => {
    const dir = await mkdtemp(join(tmpdir(), "edge-recovery-"));
    const file = join(dir, "state.json");
    await writeFile(file, "not-json");
    await writeFile(`${file}.bak`, JSON.stringify({ healthy: true }));
    const store = new AtomicJsonStore(file, () => ({ healthy: false }), (value) => value as { healthy: boolean });
    expect(await store.read()).toEqual({ healthy: true });
  });
});
