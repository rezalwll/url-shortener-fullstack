"use client";

import { FormEvent, useState } from "react";

export interface CreatedUrl {
  id: number;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  expiresAt: string | null;
}

interface Props {
  onCreated?: (url: CreatedUrl) => void;
}

export default function UrlForm({ onCreated }: Props) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:4000/api/urls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalUrl,
          expiresAt: expiresAt ? expiresAt : null,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error?.message || "Failed to create short URL");
      }

      const data: CreatedUrl = await res.json();
      setOriginalUrl("");
      setExpiresAt("");
      onCreated?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-200">
          Original URL
        </label>
        <input
          type="url"
          required
          value={originalUrl}
          onChange={(e) => setOriginalUrl(e.target.value)}
          className="mt-1 w-full rounded-md border border-white/10 bg-white/10 px-3 py-2 text-slate-50 placeholder:text-slate-400 shadow-sm focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
          placeholder="https://example.com/page"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200">
          Expires At (optional)
        </label>
        <input
          type="datetime-local"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
          className="mt-1 w-full rounded-md border border-white/10 bg-white/10 px-3 py-2 text-slate-50 placeholder:text-slate-400 shadow-sm focus:border-white/30 focus:outline-none focus:ring-1 focus:ring-white/30"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-500/10 border border-red-400/40 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center rounded-md bg-white text-slate-900 px-4 py-2 text-sm font-semibold shadow-sm hover:bg-slate-100 disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Short URL"}
      </button>
    </form>
  );
}
