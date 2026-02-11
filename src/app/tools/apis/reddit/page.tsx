"use client";

import { useState } from "react";
import Link from "next/link";

const ACTIONS = [
  {
    value: "popular",
    label: "Popular Posts",
    params: [
      { name: "sort", label: "Sort", default: "hot", options: ["hot", "best", "new", "top", "rising"] },
      { name: "limit", label: "Limit", default: "25", type: "number" },
      { name: "after", label: "After (cursor)", default: "", type: "text" },
    ],
  },
  {
    value: "subreddit",
    label: "Subreddit Posts",
    params: [
      { name: "subreddit", label: "Subreddit", default: "reactjs", type: "text", required: true },
      { name: "sort", label: "Sort", default: "hot", options: ["hot", "best", "new", "top", "rising"] },
      { name: "limit", label: "Limit", default: "25", type: "number" },
      { name: "after", label: "After (cursor)", default: "", type: "text" },
    ],
  },
  {
    value: "comments",
    label: "Post Comments",
    params: [
      { name: "subreddit", label: "Subreddit", default: "reactjs", type: "text", required: true },
      { name: "postId", label: "Post ID", default: "", type: "text", required: true },
      { name: "sort", label: "Sort", default: "best", options: ["best", "top", "new", "controversial"] },
    ],
  },
  {
    value: "search_subreddits",
    label: "Search Subreddits",
    params: [
      { name: "q", label: "Query", default: "", type: "text", required: true },
      { name: "limit", label: "Limit", default: "10", type: "number" },
    ],
  },
  {
    value: "popular_subreddits",
    label: "Popular Subreddits",
    params: [
      { name: "limit", label: "Limit", default: "25", type: "number" },
    ],
  },
];

export default function RedditApiPage() {
  const [action, setAction] = useState(ACTIONS[0].value);
  const [params, setParams] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  const activeAction = ACTIONS.find((a) => a.value === action)!;

  function updateParam(name: string, value: string) {
    setParams((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSend() {
    setLoading(true);
    setResponse(null);
    setStatus(null);
    setDuration(null);

    const qs = new URLSearchParams();
    qs.set("action", action);
    for (const p of activeAction.params) {
      const val = params[p.name] || p.default;
      if (val) qs.set(p.name, val);
    }

    const start = performance.now();
    try {
      const res = await fetch(`/api/reddit?${qs.toString()}`);
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
          <h1 className="text-2xl font-bold text-foreground">Reddit API</h1>
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-400">GET</span>
        </div>
        <code className="text-xs text-muted">/api/reddit</code>
        <p className="mt-2 text-sm text-secondary">
          Server-side proxy for Reddit data. Authenticates via OAuth client credentials.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request panel */}
        <div className="rounded-xl border border-edge bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Request</h2>

          <label className="mb-1 block text-xs font-medium text-secondary">Action</label>
          <select
            value={action}
            onChange={(e) => { setAction(e.target.value); setParams({}); }}
            className="mb-4 w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
          >
            {ACTIONS.map((a) => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>

          {activeAction.params.map((p) => (
            <div key={p.name} className="mb-3">
              <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-secondary">
                {p.label}
                {p.required && <span className="text-orange-400">*</span>}
              </label>
              {"options" in p && p.options ? (
                <select
                  value={params[p.name] || p.default}
                  onChange={(e) => updateParam(p.name, e.target.value)}
                  className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
                >
                  {p.options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={p.type || "text"}
                  value={params[p.name] ?? p.default}
                  onChange={(e) => updateParam(p.name, e.target.value)}
                  placeholder={p.default || p.label}
                  className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint outline-none focus:border-orange-500"
                />
              )}
            </div>
          ))}

          <button
            onClick={handleSend}
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-orange-600 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Request"}
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
          <pre className="max-h-[600px] overflow-auto rounded-lg bg-background p-4 text-xs text-secondary">
            {response ?? "Response will appear here..."}
          </pre>
        </div>
      </div>

      {/* Code Examples */}
      <div className="mt-6 rounded-xl border border-edge bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold text-foreground">Code Examples</h2>
        <div className="space-y-4">
          <div>
            <h3 className="mb-1.5 text-xs font-medium text-secondary">Fetch popular posts</h3>
            <pre className="overflow-auto rounded-lg bg-background p-4 text-xs text-secondary">{`const res = await fetch("/api/reddit?action=popular&sort=hot&limit=10");
const data = await res.json();
// data.posts: RedditPost[]`}</pre>
          </div>
          <div>
            <h3 className="mb-1.5 text-xs font-medium text-secondary">Fetch subreddit posts</h3>
            <pre className="overflow-auto rounded-lg bg-background p-4 text-xs text-secondary">{`const res = await fetch("/api/reddit?action=subreddit&subreddit=reactjs&sort=new&limit=25");
const data = await res.json();
// data.posts: RedditPost[], data.after: string | null`}</pre>
          </div>
          <div>
            <h3 className="mb-1.5 text-xs font-medium text-secondary">Fetch post comments</h3>
            <pre className="overflow-auto rounded-lg bg-background p-4 text-xs text-secondary">{`const res = await fetch("/api/reddit?action=comments&subreddit=reactjs&postId=1abc2de&sort=best");
const data = await res.json();
// data.post: RedditPost, data.comments: RedditComment[]`}</pre>
          </div>
          <div>
            <h3 className="mb-1.5 text-xs font-medium text-secondary">Search subreddits</h3>
            <pre className="overflow-auto rounded-lg bg-background p-4 text-xs text-secondary">{`const res = await fetch("/api/reddit?action=search_subreddits&q=javascript&limit=10");
const data = await res.json();
// data.subreddits: { name, title, subscribers, icon_img }[]`}</pre>
          </div>
          <div>
            <h3 className="mb-1.5 text-xs font-medium text-secondary">Paginate with cursor</h3>
            <pre className="overflow-auto rounded-lg bg-background p-4 text-xs text-secondary">{`// First page
const page1 = await fetch("/api/reddit?action=popular&limit=10").then(r => r.json());

// Next page using the "after" cursor
if (page1.after) {
  const page2 = await fetch(
    \`/api/reddit?action=popular&limit=10&after=\${page1.after}\`
  ).then(r => r.json());
}`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
