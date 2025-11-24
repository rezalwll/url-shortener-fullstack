"use client";

import { useEffect, useState } from "react";
import UrlForm, { CreatedUrl } from "../components/UrlForm";
import UrlTable, { UrlItem } from "../components/UrlTable";

export default function Home() {
  const [urls, setUrls] = useState<UrlItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUrls = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:4000/api/urls");
      if (!res.ok) {
        throw new Error("Failed to load URLs");
      }
      const data: UrlItem[] = await res.json();
      setUrls(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleCreated = (url: CreatedUrl) => {
    setUrls((prev) => [url, ...prev]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-14 space-y-10">
        <header className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Tiny links, clear insights
          </p>
          <h1 className="text-4xl font-semibold text-white">URL Shortener</h1>
          <p className="text-base text-slate-200 max-w-2xl">
            Create concise links, track clicks, and manage expirations — all from one lightweight dashboard.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Create a short URL</h2>
                <p className="text-sm text-slate-300 mt-1">
                  Enter a valid URL and optionally set an expiration date.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <UrlForm onCreated={handleCreated} />
            </div>
          </section>

          <section className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Your URLs</h2>
                <p className="text-sm text-slate-300 mt-1">Latest links appear first.</p>
              </div>
              <button
                onClick={fetchUrls}
                className="text-sm font-medium text-slate-200 hover:text-white underline decoration-slate-400 decoration-dashed"
              >
                Refresh
              </button>
            </div>

            <div className="mt-4">
              <UrlTable urls={urls} loading={loading} error={error} />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
