import type { ClickEvent, LinkRecord } from "../domain/link.js";
import type { IdempotencyRecord } from "../domain/repository.js";

export interface PersistedState {
  readonly schemaVersion: 1;
  readonly links: readonly LinkRecord[];
  readonly events: readonly ClickEvent[];
  readonly idempotency: Readonly<Record<string, IdempotencyRecord>>;
}

export const emptyState = (): PersistedState => ({
  schemaVersion: 1,
  links: [],
  events: [],
  idempotency: {}
});

export function validateState(value: unknown): PersistedState {
  if (!value || typeof value !== "object") throw new Error("persisted state must be an object");
  const state = value as Partial<PersistedState>;
  if (state.schemaVersion !== 1 || !Array.isArray(state.links) || !Array.isArray(state.events) || !state.idempotency) {
    throw new Error("unsupported or corrupt persisted state");
  }
  return state as PersistedState;
}
