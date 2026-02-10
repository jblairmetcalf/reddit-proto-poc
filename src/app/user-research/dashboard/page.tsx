"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  where,
  type QueryConstraint,
} from "firebase/firestore";

interface TrackingEvent {
  type: string;
  sessionId: string;
  participantId?: string;
  studyId?: string;
  variant?: string;
  timestamp: number;
  data?: Record<string, unknown>;
  device?: {
    userAgent: string;
    platform: string;
    screenWidth: number;
    screenHeight: number;
    viewportWidth: number;
    viewportHeight: number;
    touchSupported: boolean;
  };
}

interface Study {
  id: string;
  name: string;
  prototypeVariant: string;
  createdAt?: { seconds: number };
}

const EVENT_COLORS: Record<string, string> = {
  session_start: "bg-green-500/20 text-green-400 border-green-500/30",
  session_end: "bg-red-500/20 text-red-400 border-red-500/30",
  page_view: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  tab_switch: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  post_click: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  vote: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  comment_vote: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  search: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  community_click: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  share_click: "bg-teal-500/20 text-teal-400 border-teal-500/30",
  create_post_open: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  sort_change: "bg-violet-500/20 text-violet-400 border-violet-500/30",
};

const VARIANT_COLORS: Record<string, string> = {
  default: "bg-zinc-700 text-zinc-300",
  "variant-a": "bg-blue-500/20 text-blue-400",
  "variant-b": "bg-green-500/20 text-green-400",
  "variant-c": "bg-purple-500/20 text-purple-400",
};

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getDeviceLabel(device?: TrackingEvent["device"]): string {
  if (!device) return "Unknown";
  const isMobile = device.touchSupported && device.screenWidth < 768;
  return isMobile ? "Mobile" : "Desktop";
}

export default function DashboardPage() {
  const [events, setEvents] = useState<(TrackingEvent & { id: string })[]>([]);
  const [connected, setConnected] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedStudyId, setSelectedStudyId] = useState<string>("");

  // Load studies
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "studies"), (snap) => {
      const docs = snap.docs.map((d) => {
        const data = d.data() as Omit<Study, "id">;
        return { id: d.id, ...data };
      });
      docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setStudies(docs);
    });
    return () => unsub();
  }, []);

  // Load events (filtered by study when selected)
  useEffect(() => {
    const constraints: QueryConstraint[] = [];

    if (selectedStudyId) {
      constraints.push(where("studyId", "==", selectedStudyId));
    }

    const q = query(collection(db, "events"), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as TrackingEvent),
        }));
        docs.sort((a, b) => b.timestamp - a.timestamp);
        const limited = docs.slice(0, 100);
        setEvents(limited);
        setConnected(true);
      },
      (err) => {
        console.error("Firestore listener error:", err);
        setConnected(false);
      }
    );

    return () => unsubscribe();
  }, [selectedStudyId]);

  // Derived stats
  const uniqueSessions = new Set(events.map((e) => e.sessionId)).size;
  const uniqueParticipants = new Set(
    events.filter((e) => e.participantId).map((e) => e.participantId)
  ).size;
  const eventsByType: Record<string, number> = {};
  for (const e of events) {
    eventsByType[e.type] = (eventsByType[e.type] || 0) + 1;
  }
  const sortedTypes = Object.entries(eventsByType).sort(
    ([, a], [, b]) => b - a
  );

  // Variant comparison stats
  const variantStats = (() => {
    if (!selectedStudyId) return null;
    const variants = new Set(events.map((e) => e.variant).filter(Boolean));
    if (variants.size <= 1) return null;

    const stats: Record<string, { events: number; sessions: Set<string>; topActions: Record<string, number> }> = {};
    for (const e of events) {
      const v = e.variant || "unknown";
      if (!stats[v]) stats[v] = { events: 0, sessions: new Set(), topActions: {} };
      stats[v].events++;
      stats[v].sessions.add(e.sessionId);
      stats[v].topActions[e.type] = (stats[v].topActions[e.type] || 0) + 1;
    }
    return stats;
  })();

  const selectedStudy = studies.find((s) => s.id === selectedStudyId);

  const handleSummarize = async () => {
    setSummarizing(true);
    setSummary(null);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          events: events.slice(0, 50).map((e) => ({
            type: e.type,
            sessionId: e.sessionId,
            participantId: e.participantId,
            studyId: e.studyId,
            variant: e.variant,
            timestamp: e.timestamp,
            data: e.data,
          })),
          ...(selectedStudy && {
            studyId: selectedStudy.id,
            studyName: selectedStudy.name,
            variant: selectedStudy.prototypeVariant,
          }),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
      } else {
        setSummary("Failed to generate summary.");
      }
    } catch {
      setSummary("Error connecting to summarize API.");
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Live Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Real-time event stream from prototype interactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedStudyId}
            onChange={(e) => {
              setSelectedStudyId(e.target.value);
              setSummary(null);
            }}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
          >
            <option value="">All Studies</option>
            {studies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleSummarize}
            disabled={summarizing || events.length === 0}
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {summarizing ? "Summarizing..." : "AI Summary"}
          </button>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
              connected
                ? "bg-green-500/20 text-green-400"
                : "bg-zinc-700 text-zinc-400"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? "bg-green-400 animate-pulse" : "bg-zinc-500"
              }`}
            />
            {connected ? "Connected" : "Connecting..."}
          </span>
        </div>
      </header>

      {/* AI Summary */}
      {summary && (
        <div className="mb-6 rounded-xl border border-purple-500/30 bg-purple-500/10 p-5">
          <h3 className="mb-2 text-sm font-semibold text-purple-400">
            AI Summary
            {selectedStudy && (
              <span className="ml-2 text-xs font-normal text-purple-300">
                — {selectedStudy.name} ({selectedStudy.prototypeVariant})
              </span>
            )}
          </h3>
          <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
            {summary}
          </p>
        </div>
      )}

      {/* Stats cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs font-medium uppercase text-zinc-500">
            Total Events
          </p>
          <p className="mt-1 text-2xl font-bold text-white">{events.length}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs font-medium uppercase text-zinc-500">
            Sessions
          </p>
          <p className="mt-1 text-2xl font-bold text-white">
            {uniqueSessions}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs font-medium uppercase text-zinc-500">
            Participants
          </p>
          <p className="mt-1 text-2xl font-bold text-white">
            {uniqueParticipants}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs font-medium uppercase text-zinc-500">
            Event Types
          </p>
          <p className="mt-1 text-2xl font-bold text-white">
            {sortedTypes.length}
          </p>
        </div>
      </div>

      {/* Variant Comparison */}
      {variantStats && (
        <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">
            Variant Comparison
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(variantStats).map(([variant, stats]) => {
              const topActions = Object.entries(stats.topActions)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3);
              return (
                <div
                  key={variant}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${VARIANT_COLORS[variant] || VARIANT_COLORS.default}`}
                    >
                      {variant}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Events</span>
                      <span className="font-medium text-white">{stats.events}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Sessions</span>
                      <span className="font-medium text-white">{stats.sessions.size}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-zinc-700">
                      <p className="text-zinc-500 mb-1">Top actions</p>
                      {topActions.map(([action, count]) => (
                        <div key={action} className="flex justify-between">
                          <span className="font-mono text-zinc-400">{action}</span>
                          <span className="text-zinc-500">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Event type breakdown */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">
            Event Breakdown
          </h2>
          {sortedTypes.length === 0 ? (
            <p className="text-sm text-zinc-500">
              No events yet. Interact with the prototype to see data.
            </p>
          ) : (
            <div className="space-y-2">
              {sortedTypes.map(([type, count]) => {
                const pct = Math.round((count / events.length) * 100);
                return (
                  <div key={type}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-mono text-zinc-400">{type}</span>
                      <span className="text-zinc-500">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800">
                      <div
                        className="h-1.5 rounded-full bg-orange-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live event stream */}
        <div className="lg:col-span-2 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">
            Live Event Stream
          </h2>
          {events.length === 0 ? (
            <p className="text-sm text-zinc-500">
              Waiting for events... Open{" "}
              <a
                href="/prototype"
                target="_blank"
                className="text-orange-400 underline"
              >
                /prototype
              </a>{" "}
              and interact with it.
            </p>
          ) : (
            <div className="max-h-[500px] space-y-2 overflow-y-auto pr-2">
              {events.map((event) => {
                const colorClass =
                  EVENT_COLORS[event.type] ||
                  "bg-zinc-700/30 text-zinc-400 border-zinc-600/30";
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-950/50 p-3"
                  >
                    <span
                      className={`mt-0.5 shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${colorClass}`}
                    >
                      {event.type}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>{formatTime(event.timestamp)}</span>
                        <span>&middot;</span>
                        <span className="font-mono truncate">
                          {event.sessionId}
                        </span>
                        {event.participantId && (
                          <>
                            <span>&middot;</span>
                            <span className="text-blue-400">
                              {event.participantId}
                            </span>
                          </>
                        )}
                        {event.variant && (
                          <>
                            <span>&middot;</span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${VARIANT_COLORS[event.variant] || VARIANT_COLORS.default}`}
                            >
                              {event.variant}
                            </span>
                          </>
                        )}
                        <span>&middot;</span>
                        <span>{getDeviceLabel(event.device)}</span>
                      </div>
                      {event.data &&
                        Object.keys(event.data).length > 0 && (
                          <pre className="mt-1 text-[11px] leading-relaxed text-zinc-600 truncate">
                            {JSON.stringify(event.data)}
                          </pre>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
