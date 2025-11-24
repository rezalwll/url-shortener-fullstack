"use client";

import { useState } from "react";

export interface UrlItem {
  id: number;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clicks: number;
  createdAt: string;
  expiresAt: string | null;
}

interface Props {
  urls: UrlItem[];
  loading: boolean;
  error: string | null;
}

export default function UrlTable({ urls, loading, error }: Props) {
  const [copyStatus, setCopyStatus] = useState<Record<string, string>>({});

  const copy = async (url: string, code: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyStatus((prev) => ({ ...prev, [code]: "Copied!" }));
      setTimeout(
        () => setCopyStatus((prev) => ({ ...prev, [code]: "" })),
        1500
      );
    } catch {
      setCopyStatus((prev) => ({ ...prev, [code]: "Copy failed" }));
    }
  };

  if (loading) {
    return <div className="text-sm text-slate-300">Loading URLs…</div>;
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-500/10 border border-red-400/40 px-3 py-2 text-sm text-red-200">
        {error}
      </div>
    );
  }

  if (!urls.length) {
    return (
      <div className="text-sm text-slate-300">
        No URLs created yet. Start by adding one above.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-slate-300">
            <th className="py-2 pr-4">Original URL</th>
            <th className="py-2 pr-4">Short URL</th>
            <th className="py-2 pr-4">Clicks</th>
            <th className="py-2 pr-4">Created</th>
            <th className="py-2 pr-4">Expires</th>
            <th className="py-2 pr-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {urls.map((url) => (
            <tr key={url.id} className="align-top text-slate-50">
              <td className="py-3 pr-4 max-w-xs break-words text-slate-100">
                <a
                  href={url.originalUrl}
                  className="underline decoration-dotted decoration-slate-400"
                  target="_blank"
                  rel="noreferrer"
                >
                  {url.originalUrl}
                </a>
              </td>
              <td className="py-3 pr-4">
                <a
                  href={url.shortUrl}
                  className="underline decoration-dotted decoration-slate-400"
                  target="_blank"
                  rel="noreferrer"
                >
                  {url.shortUrl}
                </a>
              </td>
              <td className="py-3 pr-4 font-semibold">{url.clicks}</td>
              <td className="py-3 pr-4 text-slate-200">
                {new Date(url.createdAt).toLocaleString()}
              </td>
              <td className="py-3 pr-4 text-slate-200">
                {url.expiresAt ? new Date(url.expiresAt).toLocaleString() : "—"}
              </td>
              <td className="py-3 pr-4 text-right">
                <button
                  onClick={() => copy(url.shortUrl, url.shortCode)}
                  className="rounded-md border border-white/20 px-3 py-1 text-xs font-medium text-slate-900 bg-white hover:bg-slate-100"
                >
                  Copy
                </button>
                <span className="ml-2 text-xs text-slate-300">
                  {copyStatus[url.shortCode] || ""}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
