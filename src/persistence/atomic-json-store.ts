import { copyFile, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { AsyncMutex } from "../lib/async-mutex.js";

export class AtomicJsonStore<T> {
  private readonly mutex = new AsyncMutex();

  constructor(
    private readonly filePath: string,
    private readonly fallback: () => T,
    private readonly validate: (value: unknown) => T
  ) {}

  async read(): Promise<T> {
    try {
      return this.validate(JSON.parse(await readFile(this.filePath, "utf8")) as unknown);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return this.fallback();
      try {
        return this.validate(JSON.parse(await readFile(`${this.filePath}.bak`, "utf8")) as unknown);
      } catch {
        throw error;
      }
    }
  }

  async update(mutator: (current: T) => T | Promise<T>): Promise<T> {
    return this.mutex.runExclusive(async () => {
      const current = await this.read();
      const next = await mutator(current);
      await this.write(next);
      return next;
    });
  }

  private async write(value: T): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    const temporary = `${this.filePath}.${process.pid}.tmp`;
    await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
    try {
      await copyFile(this.filePath, `${this.filePath}.bak`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    await rename(temporary, this.filePath);
    await rm(temporary, { force: true });
  }
}
