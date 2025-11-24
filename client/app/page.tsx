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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-12 space-y-8">
        <header>
          <h1 className="text-3xl font-semibold">URL Shortener</h1>
          <p className="mt-3 text-slate-700">
            Create short links and track click stats.
          </p>
        </header>

        <section className="bg-white shadow-sm rounded-lg border border-slate-200 p-6">
          <h2 className="text-xl font-semibold">Create a short URL</h2>
          <p className="text-sm text-slate-600 mt-1">
            Enter a valid URL and optionally set an expiration date.
          </p>
          <div className="mt-4">
            <UrlForm onCreated={handleCreated} />
          </div>
        </section>

        <section className="bg-white shadow-sm rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Your URLs</h2>
              <p className="text-sm text-slate-600 mt-1">
                Latest links appear first.
              </p>
            </div>
            <button
              onClick={fetchUrls}
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              Refresh
            </button>
          </div>

          <div className="mt-4">
            <UrlTable urls={urls} loading={loading} error={error} />
          </div>
        </section>
      </div>
    </main>
  );
}
