export interface Closable {
  close(): Promise<unknown>;
}

export function installGracefulShutdown(
  target: Closable,
  options: { timeoutMs?: number; exit?: (code: number) => void } = {}
): () => void {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const exit = options.exit ?? ((code) => process.exit(code));
  let closing = false;
  let timeout: NodeJS.Timeout | undefined;
  const close = (): void => {
    if (closing) return;
    closing = true;
    timeout = setTimeout(() => exit(1), timeoutMs).unref();
    void target.close().then(() => {
      if (timeout) clearTimeout(timeout);
      exit(0);
    }, () => {
      if (timeout) clearTimeout(timeout);
      exit(1);
    });
  };
  process.once("SIGINT", close);
  process.once("SIGTERM", close);
  return () => {
    process.off("SIGINT", close);
    process.off("SIGTERM", close);
    if (timeout) clearTimeout(timeout);
  };
}
