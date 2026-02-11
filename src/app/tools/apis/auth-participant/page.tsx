"use client";

import { useState } from "react";
import Link from "next/link";

type Mode = "create" | "verify";

export default function AuthParticipantApiPage() {
  const [mode, setMode] = useState<Mode>("create");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  // POST fields
  const [participantId, setParticipantId] = useState("");
  const [studyId, setStudyId] = useState("");
  const [name, setName] = useState("");
  const [prototypeVariant, setPrototypeVariant] = useState("");

  // GET fields
  const [token, setToken] = useState("");

  async function handleSend() {
    setLoading(true);
    setResponse(null);
    setStatus(null);
    setDuration(null);

    const start = performance.now();
    try {
      let res: Response;
      if (mode === "create") {
        const body: Record<string, string> = { participantId, studyId, name };
        if (prototypeVariant) body.prototypeVariant = prototypeVariant;
        res = await fetch("/api/auth/participant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`/api/auth/participant?token=${encodeURIComponent(token)}`);
      }
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
          <h1 className="text-2xl font-bold text-foreground">Participant Auth</h1>
          <span className="rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-blue-400">POST</span>
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-400">GET</span>
        </div>
        <code className="text-xs text-muted">/api/auth/participant</code>
        <p className="mt-2 text-sm text-secondary">
          Create JWT tokens for participant prototype access, or verify existing tokens.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Request panel */}
        <div className="rounded-xl border border-edge bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">Request</h2>

          <label className="mb-1 block text-xs font-medium text-secondary">Mode</label>
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => setMode("create")}
              className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-colors ${
                mode === "create"
                  ? "border-orange-500 bg-orange-600/10 text-orange-400"
                  : "border-edge-strong text-secondary hover:border-edge-strong"
              }`}
            >
              POST &mdash; Create Token
            </button>
            <button
              onClick={() => setMode("verify")}
              className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-colors ${
                mode === "verify"
                  ? "border-orange-500 bg-orange-600/10 text-orange-400"
                  : "border-edge-strong text-secondary hover:border-edge-strong"
              }`}
            >
              GET &mdash; Verify Token
            </button>
          </div>

          {mode === "create" ? (
            <>
              <div className="mb-3">
                <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-secondary">
                  Participant ID <span className="text-orange-400">*</span>
                </label>
                <input
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  placeholder="participant-001"
                  className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint outline-none focus:border-orange-500"
                />
              </div>
              <div className="mb-3">
                <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-secondary">
                  Study ID <span className="text-orange-400">*</span>
                </label>
                <input
                  value={studyId}
                  onChange={(e) => setStudyId(e.target.value)}
                  placeholder="study-abc123"
                  className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint outline-none focus:border-orange-500"
                />
              </div>
              <div className="mb-3">
                <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-secondary">
                  Name <span className="text-orange-400">*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint outline-none focus:border-orange-500"
                />
              </div>
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium text-secondary">
                  Prototype Variant
                </label>
                <select
                  value={prototypeVariant}
                  onChange={(e) => setPrototypeVariant(e.target.value)}
                  className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground outline-none focus:border-orange-500"
                >
                  <option value="">None</option>
                  <option value="default">Default</option>
                  <option value="variant-a">Variant A</option>
                  <option value="variant-b">Variant B</option>
                  <option value="variant-c">Variant C</option>
                </select>
              </div>
            </>
          ) : (
            <div className="mb-3">
              <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-secondary">
                Token <span className="text-orange-400">*</span>
              </label>
              <textarea
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIs..."
                rows={4}
                className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint outline-none focus:border-orange-500 font-mono"
              />
            </div>
          )}

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
            <h3 className="mb-1.5 text-xs font-medium text-secondary">Create a participant token</h3>
            <pre className="overflow-auto rounded-lg bg-background p-4 text-xs text-secondary">{`const res = await fetch("/api/auth/participant", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    participantId: "participant-001",
    studyId: "study-abc123",
    name: "Jane Doe",
    prototypeVariant: "variant-a",  // optional
  }),
});
const data = await res.json();
// data.token: string (JWT)
// data.url: string (prototype URL with token)`}</pre>
          </div>
          <div>
            <h3 className="mb-1.5 text-xs font-medium text-secondary">Verify a token</h3>
            <pre className="overflow-auto rounded-lg bg-background p-4 text-xs text-secondary">{`const token = "eyJhbGciOiJIUzI1NiIs...";
const res = await fetch(\`/api/auth/participant?token=\${encodeURIComponent(token)}\`);
const data = await res.json();

if (data.valid) {
  // data.participantId: string
  // data.studyId: string
  // data.name: string
  // data.prototypeVariant?: string
}`}</pre>
          </div>
          <div>
            <h3 className="mb-1.5 text-xs font-medium text-secondary">Full invite flow</h3>
            <pre className="overflow-auto rounded-lg bg-background p-4 text-xs text-secondary">{`// 1. Create token for participant
const { token, url } = await fetch("/api/auth/participant", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    participantId: "p-042",
    studyId: "study-xyz",
    name: "Alex Smith",
  }),
}).then(r => r.json());

// 2. Send the URL to the participant (e.g. via email)
console.log("Invite link:", url);
// → /prototype?token=eyJhbGci...

// 3. On prototype load, verify the token server-side
const { valid, participantId, studyId } = await fetch(
  \`/api/auth/participant?token=\${token}\`
).then(r => r.json());`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
