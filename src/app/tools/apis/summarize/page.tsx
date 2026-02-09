"use client";

import { useState } from "react";
import Link from "next/link";

const SAMPLE_EVENTS = JSON.stringify(
  [
    { timestamp: Date.now() - 60000, type: "session_start", sessionId: "s1" },
    { timestamp: Date.now() - 55000, type: "post_view", sessionId: "s1", data: { postId: "abc", subreddit: "reactjs" } },
    { timestamp: Date.now() - 40000, type: "upvote", sessionId: "s1", data: { postId: "abc" } },
    { timestamp: Date.now() - 30000, type: "comment_expand", sessionId: "s1", data: { postId: "abc", commentCount: 42 } },
    { timestamp: Date.now() - 10000, type: "session_end", sessionId: "s1" },
  ],
  null,
  2
);

export default function SummarizeApiPage() {
  const [events, setEvents] = useState(SAMPLE_EVENTS);
  const [studyId, setStudyId] = useState("");
  const [studyName, setStudyName] = useState("");
  const [variant, setVariant] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  async function handleSend() {
    setLoading(true);
    setResponse(null);
    setStatus(null);
    setDuration(null);

    let parsedEvents;
    try {
      parsedEvents = JSON.parse(events);
    } catch {
      setResponse("Invalid JSON in events field");
      setLoading(false);
      return;
    }

    const body: Record<string, unknown> = { events: parsedEvents };
    if (studyId) body.studyId = studyId;
    if (studyName) body.studyName = studyName;
    if (variant) body.variant = variant;

    const start = performance.now();
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const elapsed = Math.round(performance.now() - start);
      setDuration(elapsed);
      setStatus(res.status);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setDuration(Math.round(performance.now() - start));
      setResponse(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/tools/apis" className="text-sm text-zinc-500 hover:text-white transition-colors">&larr;</Link>
          <h1 className="text-2xl font-bold text-white">AI Summarize</h1>
          <span className="rounded-full bg-purple-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-purple-400">POST</span>
        </div>
        <code className="text-xs text-zinc-500">/api/summarize</code>
        <p className="mt-2 text-sm text-zinc-400">
          Send prototype interaction events to Claude AI for UX research analysis.
          Returns a 3-5 paragraph summary of behavior patterns, engagement signals, and recommendations.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request panel */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">Request</h2>

          <div className="mb-3">
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-zinc-400">
              Events (JSON array) <span className="text-orange-400">*</span>
            </label>
            <textarea
              value={events}
              onChange={(e) => setEvents(e.target.value)}
              rows={12}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-white placeholder:text-zinc-600 outline-none focus:border-orange-500 font-mono"
            />
          </div>

          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Study ID</label>
              <input
                value={studyId}
                onChange={(e) => setStudyId(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">Study Name</label>
              <input
                value={studyName}
                onChange={(e) => setStudyName(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-zinc-400">Variant</label>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
            >
              <option value="">None</option>
              <option value="default">Default</option>
              <option value="variant-a">Variant A</option>
              <option value="variant-b">Variant B</option>
              <option value="variant-c">Variant C</option>
            </select>
          </div>

          <button
            onClick={handleSend}
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-orange-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Send Request"}
          </button>
        </div>

        {/* Response panel */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Response</h2>
            {status !== null && (
              <div className="flex items-center gap-3 text-xs">
                <span className={status < 400 ? "text-emerald-400" : "text-red-400"}>
                  {status}
                </span>
                {duration !== null && <span className="text-zinc-500">{duration}ms</span>}
              </div>
            )}
          </div>
          <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap rounded-lg bg-zinc-950 p-4 text-xs text-zinc-300">
            {response ?? "Response will appear here..."}
          </pre>
        </div>
      </div>
    </div>
  );
}
