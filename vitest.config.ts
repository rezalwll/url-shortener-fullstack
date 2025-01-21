import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
    coverage: { enabled: false },
    pool: "forks",
    poolOptions: { forks: { singleFork: true } }
  }
});
