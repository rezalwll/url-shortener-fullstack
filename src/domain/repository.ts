import type { ClickEvent, LinkRecord, LinkStats } from "./link.js";

export interface LinkCursor {
  readonly createdAt: string;
  readonly id: string;
}

export interface LinkPage {
  readonly items: readonly LinkRecord[];
  readonly next: LinkCursor | null;
}

export interface IdempotencyRecord {
  readonly key: string;
  readonly fingerprint: string;
  readonly linkId: string;
}

export interface LinkRepository {
  create(link: LinkRecord): Promise<LinkRecord>;
  findById(id: string): Promise<LinkRecord | null>;
  findBySlug(slug: string): Promise<LinkRecord | null>;
  list(limit: number, cursor: LinkCursor | null): Promise<LinkPage>;
  disable(id: string, disabledAt: string): Promise<LinkRecord | null>;
  recordClick(id: string, event: ClickEvent): Promise<LinkRecord | null>;
  stats(id: string): Promise<LinkStats | null>;
  findIdempotency(key: string): Promise<IdempotencyRecord | null>;
  saveIdempotency(record: IdempotencyRecord): Promise<void>;
  ready(): Promise<boolean>;
}
