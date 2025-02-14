export interface LinkRecord {
  readonly id: string;
  readonly slug: string;
  readonly target: string;
  readonly createdAt: string;
  readonly expiresAt: string | null;
  readonly disabledAt: string | null;
  readonly clicks: number;
  readonly lastVisitedAt: string | null;
  readonly version: number;
}

export interface ClickEvent {
  readonly linkId: string;
  readonly occurredAt: string;
  readonly visitorHash: string;
  readonly referrerHost: string | null;
}

export interface CreateLinkInput {
  readonly target: string;
  readonly customSlug?: string;
  readonly expiresAt?: string | null;
}

export interface LinkView extends LinkRecord {
  readonly shortUrl: string;
}

export interface LinkStats {
  readonly linkId: string;
  readonly clicks: number;
  readonly uniqueVisitors: number;
  readonly referrers: ReadonlyArray<{ host: string; clicks: number }>;
}
