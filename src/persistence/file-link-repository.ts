import { DomainError } from "../domain/errors.js";
import type { ClickEvent, LinkRecord, LinkStats } from "../domain/link.js";
import type { IdempotencyRecord, LinkCursor, LinkPage, LinkRepository } from "../domain/repository.js";
import { AtomicJsonStore } from "./atomic-json-store.js";
import { emptyState, validateState, type PersistedState } from "./state.js";

const withLinks = (state: PersistedState, links: readonly LinkRecord[]): PersistedState => ({ ...state, links });

export class FileLinkRepository implements LinkRepository {
  private readonly store: AtomicJsonStore<PersistedState>;

  constructor(filePath: string) {
    this.store = new AtomicJsonStore(filePath, emptyState, validateState);
  }

  async create(link: LinkRecord): Promise<LinkRecord> {
    await this.store.update((state) => {
      if (state.links.some((item) => item.slug === link.slug)) throw new DomainError("SLUG_CONFLICT", "slug is already in use", 409);
      return withLinks(state, [...state.links, link]);
    });
    return link;
  }

  async findById(id: string): Promise<LinkRecord | null> {
    return (await this.store.read()).links.find((link) => link.id === id) ?? null;
  }

  async findBySlug(slug: string): Promise<LinkRecord | null> {
    return (await this.store.read()).links.find((link) => link.slug === slug) ?? null;
  }

  async list(limit: number, cursor: LinkCursor | null): Promise<LinkPage> {
    const sorted = [...(await this.store.read()).links].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
    const cursorIndex = cursor ? sorted.findIndex((item) => item.createdAt === cursor.createdAt && item.id === cursor.id) : -1;
    const start = cursor ? cursorIndex + 1 : 0;
    const items = sorted.slice(start, start + limit);
    const last = items.at(-1);
    return { items, next: start + items.length < sorted.length && last ? { createdAt: last.createdAt, id: last.id } : null };
  }

  async disable(id: string, disabledAt: string): Promise<LinkRecord | null> {
    let result: LinkRecord | null = null;
    await this.store.update((state) => withLinks(state, state.links.map((link) => {
      if (link.id !== id) return link;
      result = { ...link, disabledAt, version: link.version + 1 };
      return result;
    })));
    return result;
  }

  async recordClick(id: string, event: ClickEvent): Promise<LinkRecord | null> {
    let result: LinkRecord | null = null;
    await this.store.update((state) => {
      const links = state.links.map((link) => {
        if (link.id !== id) return link;
        result = { ...link, clicks: link.clicks + 1, lastVisitedAt: event.occurredAt, version: link.version + 1 };
        return result;
      });
      return { ...state, links, events: [...state.events, event] };
    });
    return result;
  }

  async stats(id: string): Promise<LinkStats | null> {
    const state = await this.store.read();
    const link = state.links.find((item) => item.id === id);
    if (!link) return null;
    const events = state.events.filter((event) => event.linkId === id);
    const referrers = new Map<string, number>();
    for (const event of events) if (event.referrerHost) referrers.set(event.referrerHost, (referrers.get(event.referrerHost) ?? 0) + 1);
    return {
      linkId: id,
      clicks: link.clicks,
      uniqueVisitors: new Set(events.map((event) => event.visitorHash)).size,
      referrers: [...referrers].map(([host, clicks]) => ({ host, clicks })).sort((a, b) => b.clicks - a.clicks || a.host.localeCompare(b.host))
    };
  }

  async findIdempotency(key: string): Promise<IdempotencyRecord | null> {
    return (await this.store.read()).idempotency[key] ?? null;
  }

  async saveIdempotency(record: IdempotencyRecord): Promise<void> {
    await this.store.update((state) => ({ ...state, idempotency: { ...state.idempotency, [record.key]: record } }));
  }

  async ready(): Promise<boolean> {
    try {
      await this.store.read();
      return true;
    } catch {
      return false;
    }
  }
}
