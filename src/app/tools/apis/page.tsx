import Link from "next/link";

const apis = [
  {
    slug: "reddit",
    name: "Reddit API",
    description:
      "Proxy for Reddit data — popular posts, subreddit posts, comments, and subreddit search.",
    method: "GET",
    path: "/api/reddit",
  },
  {
    slug: "auth-participant",
    name: "Participant Auth",
    description:
      "Create and verify JWT tokens for research study participants.",
    method: "POST / GET",
    path: "/api/auth/participant",
  },
  {
    slug: "summarize",
    name: "AI Summarize",
    description:
      "Analyze prototype interaction events with Claude AI for UX research insights.",
    method: "POST",
    path: "/api/summarize",
  },
];

export default function ApisPage() {
  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/tools"
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            &larr;
          </Link>
          <h1 className="text-2xl font-bold text-white">APIs</h1>
        </div>
        <p className="text-sm text-zinc-400">
          Explore and test all available API endpoints.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {apis.map((api) => (
          <Link
            key={api.slug}
            href={`/tools/apis/${api.slug}`}
            className="group rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-orange-600"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white group-hover:text-orange-400">
                {api.name}
              </h2>
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] font-bold uppercase text-zinc-400">
                {api.method}
              </span>
            </div>
            <p className="mb-3 text-sm text-zinc-400">{api.description}</p>
            <code className="text-xs text-zinc-500">{api.path}</code>
          </Link>
        ))}
      </div>
    </div>
  );
}
