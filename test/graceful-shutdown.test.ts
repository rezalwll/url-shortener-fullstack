import { afterEach, describe, expect, it, vi } from "vitest";
import { installGracefulShutdown } from "../src/lifecycle/graceful-shutdown.js";

describe("graceful shutdown", () => {
  afterEach(() => process.removeAllListeners("SIGTERM"));

  it("closes once before reporting a successful exit", async () => {
    const close = vi.fn(async () => undefined);
    const exit = vi.fn();
    const dispose = installGracefulShutdown({ close }, { timeoutMs: 5_000, exit });
    process.emit("SIGTERM");
    process.emit("SIGTERM");
    await new Promise((resolve) => setImmediate(resolve));
    expect(close).toHaveBeenCalledTimes(1);
    expect(exit).toHaveBeenCalledWith(0);
    dispose();
  });
});
