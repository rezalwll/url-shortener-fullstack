import type { PersistedState } from "../persistence/state.js";

export interface CompactionResult {
  readonly state: PersistedState;
  readonly removed: number;
}

export function compactEvents(state: PersistedState, cutoff: Date, maximumEvents: number): CompactionResult {
  if (!Number.isSafeInteger(maximumEvents) || maximumEvents < 0) throw new RangeError("maximumEvents must be a non-negative integer");
  const retained = state.events
    .filter((event) => new Date(event.occurredAt) >= cutoff)
    .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt))
    .slice(-maximumEvents);
  return { state: { ...state, events: retained }, removed: state.events.length - retained.length };
}
