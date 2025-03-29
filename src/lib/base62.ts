import { randomBytes } from "node:crypto";

const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export type RandomBytes = (size: number) => Buffer;

export function createBase62Slug(length = 8, random: RandomBytes = randomBytes): string {
  if (!Number.isSafeInteger(length) || length < 4 || length > 48) {
    throw new RangeError("slug length must be between 4 and 48");
  }

  const output: string[] = [];
  while (output.length < length) {
    for (const byte of random(length * 2)) {
      if (byte >= 248) continue;
      output.push(ALPHABET[byte % ALPHABET.length] ?? "0");
      if (output.length === length) break;
    }
  }
  return output.join("");
}
