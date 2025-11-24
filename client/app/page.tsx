"use client";

import { useState } from "react";
import UrlForm, { CreatedUrl } from "../components/UrlForm";

export default function Home() {
  const [lastCreated, setLastCreated] = useState<CreatedUrl | null>(null);

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
            <UrlForm onCreated={setLastCreated} />
          </div>
          {lastCreated && (
            <div className="mt-4 rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-800">
              Short URL created:{" "}
              <a
                href={lastCreated.shortUrl}
                className="font-semibold underline"
                target="_blank"
                rel="noreferrer"
              >
                {lastCreated.shortUrl}
              </a>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
