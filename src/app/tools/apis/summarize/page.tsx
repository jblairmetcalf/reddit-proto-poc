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
    <div className="min-h-screen bg-background p-8">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/tools/apis" className="text-sm text-muted hover:text-foreground transition-colors">&larr;</Link>
          <h1 className="text-2xl font-bold text-foreground">AI Summarize</h1>
          <span className="rounded-full bg-purple-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-purple-400">POST</span>
        </div>
        <code className="text-xs text-muted">/api/summarize</code>
        <p className="mt-2 text-sm text-secondary">
          Send prototype interaction events to Gemini AI for UX research analysis.
          Returns a 3-5 paragraph summary of behavior patterns, engagement signals, and recommendations.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request panel */}
        <div className="rounded-xl border border-edge bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Request</h2>

          <div className="mb-3">
            <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-secondary">
              Events (JSON array) <span className="text-orange-400">*</span>
            </label>
            <textarea
              value={events}
              onChange={(e) => setEvents(e.target.value)}
              rows={12}
              className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-xs text-foreground placeholder:text-faint outline-none focus:border-orange-500 font-mono"
            />
          </div>

          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-secondary">Study ID</label>
              <input
                value={studyId}
                onChange={(e) => setStudyId(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-secondary">Study Name</label>
              <input
                value={studyName}
                onChange={(e) => setStudyName(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-secondary">Variant</label>
            <select
              value={variant}
              onChange={(e) => setVariant(e.target.value)}
              className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
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
        <div className="rounded-xl border border-edge bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Response</h2>
            {status !== null && (
              <div className="flex items-center gap-3 text-xs">
                <span className={status < 400 ? "text-emerald-400" : "text-red-400"}>
                  {status}
                </span>
                {duration !== null && <span className="text-muted">{duration}ms</span>}
              </div>
            )}
          </div>
          <pre className="max-h-[600px] overflow-auto whitespace-pre-wrap rounded-lg bg-background p-4 text-xs text-secondary">
            {response ?? "Response will appear here..."}
          </pre>
        </div>
      </div>

      {/* Code Examples */}
      <div className="mt-6 rounded-xl border border-edge bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Code Examples</h2>
        <div className="space-y-4">
          <div>
            <h3 className="mb-1.5 text-xs font-medium text-secondary">Basic event summarization</h3>
            <pre className="overflow-auto rounded-lg bg-background p-4 text-xs text-secondary">{`const res = await fetch("/api/summarize", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    events: [
      { timestamp: 1700000000000, type: "session_start", sessionId: "s1" },
      { timestamp: 1700000005000, type: "post_click", sessionId: "s1", data: { postId: "abc" } },
      { timestamp: 1700000020000, type: "vote", sessionId: "s1", data: { postId: "abc", direction: "up" } },
      { timestamp: 1700000060000, type: "session_end", sessionId: "s1" },
    ],
  }),
});
const data = await res.json();
// data.summary: string (3-5 paragraph analysis)`}</pre>
          </div>
          <div>
            <h3 className="mb-1.5 text-xs font-medium text-secondary">With study context</h3>
            <pre className="overflow-auto rounded-lg bg-background p-4 text-xs text-secondary">{`const res = await fetch("/api/summarize", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    events: [...],     // event array
    studyId: "study-abc123",
    studyName: "Feed Algorithm Test",
    variant: "variant-a",
  }),
});
const { summary } = await res.json();`}</pre>
          </div>
          <div>
            <h3 className="mb-1.5 text-xs font-medium text-secondary">Summarize from Firestore events</h3>
            <pre className="overflow-auto rounded-lg bg-background p-4 text-xs text-secondary">{`import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

// 1. Query events for a specific study
const q = query(
  collection(db, "events"),
  where("studyId", "==", "study-abc123")
);
const snap = await getDocs(q);
const events = snap.docs.map(d => d.data());

// 2. Send to summarize API (limit to 50 most recent)
const sorted = events.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50);
const { summary } = await fetch("/api/summarize", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ events: sorted, studyId: "study-abc123" }),
}).then(r => r.json());`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
