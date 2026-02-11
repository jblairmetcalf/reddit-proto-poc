"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  onSnapshot,
  where,
  getDocs,
  deleteDoc,
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
  default: "bg-subtle text-secondary",
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
  const [allEvents, setAllEvents] = useState<(TrackingEvent & { id: string })[]>([]);
  const [connected, setConnected] = useState(false);
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
        setAllEvents(docs);
        setConnected(true);
      },
      (err) => {
        console.error("Firestore listener error:", err);
        setConnected(false);
      }
    );

    return () => unsubscribe();
  }, [selectedStudyId]);

  // Stream limited to 100 most recent for display
  const streamEvents = allEvents.slice(0, 100);

  // Derived stats from ALL events
  const uniqueSessions = new Set(allEvents.map((e) => e.sessionId)).size;
  const uniqueParticipants = new Set(
    allEvents.filter((e) => e.participantId).map((e) => e.participantId)
  ).size;
  const eventsByType: Record<string, number> = {};
  for (const e of allEvents) {
    eventsByType[e.type] = (eventsByType[e.type] || 0) + 1;
  }
  const sortedTypes = Object.entries(eventsByType).sort(
    ([, a], [, b]) => b - a
  );

  // Variant comparison stats
  const variantStats = (() => {
    if (!selectedStudyId) return null;
    const variants = new Set(allEvents.map((e) => e.variant).filter(Boolean));
    if (variants.size <= 1) return null;

    const stats: Record<string, { events: number; sessions: Set<string>; topActions: Record<string, number> }> = {};
    for (const e of allEvents) {
      const v = e.variant || "unknown";
      if (!stats[v]) stats[v] = { events: 0, sessions: new Set(), topActions: {} };
      stats[v].events++;
      stats[v].sessions.add(e.sessionId);
      stats[v].topActions[e.type] = (stats[v].topActions[e.type] || 0) + 1;
    }
    return stats;
  })();

  const selectedStudy = studies.find((s) => s.id === selectedStudyId);

  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleClearEvents = async (studyFilter?: string) => {
    setDeleting(true);
    try {
      const constraints: QueryConstraint[] = [];
      if (studyFilter) {
        constraints.push(where("studyId", "==", studyFilter));
      }
      const q = query(collection(db, "events"), ...constraints);
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    } catch (err) {
      console.error("Failed to clear events:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Live Dashboard</h1>
          <p className="mt-1 text-sm text-secondary">
            Real-time event stream from prototype interactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedStudyId}
            onChange={(e) => setSelectedStudyId(e.target.value)}
            className="rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none"
          >
            <option value="">All Studies</option>
            {studies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (selectedStudyId) {
                const studyName = selectedStudy?.name || selectedStudyId;
                setConfirmAction(() => () => handleClearEvents(selectedStudyId));
                setConfirmMessage(`Delete all tracking events for "${studyName}"?`);
              } else {
                setConfirmAction(() => () => handleClearEvents());
                setConfirmMessage("Delete all tracking events across all studies?");
              }
            }}
            disabled={deleting || allEvents.length === 0}
            className="rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? "Clearing..." : selectedStudyId ? "Clear Study Events" : "Clear All Events"}
          </button>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
              connected
                ? "bg-green-500/20 text-green-400"
                : "bg-subtle text-secondary"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                connected ? "bg-green-400 animate-pulse" : "bg-muted"
              }`}
            />
            {connected ? "Connected" : "Connecting..."}
          </span>
        </div>
      </header>

      {/* Stats cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-edge bg-card p-4">
          <p className="text-xs font-medium uppercase text-muted">
            Total Events
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">{allEvents.length}</p>
        </div>
        <div className="rounded-xl border border-edge bg-card p-4">
          <p className="text-xs font-medium uppercase text-muted">
            Sessions
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {uniqueSessions}
          </p>
        </div>
        <div className="rounded-xl border border-edge bg-card p-4">
          <p className="text-xs font-medium uppercase text-muted">
            Participants
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {uniqueParticipants}
          </p>
        </div>
        <div className="rounded-xl border border-edge bg-card p-4">
          <p className="text-xs font-medium uppercase text-muted">
            Event Types
          </p>
          <p className="mt-1 text-2xl font-bold text-foreground">
            {sortedTypes.length}
          </p>
        </div>
      </div>

      {/* Variant Comparison */}
      {variantStats && (
        <div className="mb-8 rounded-xl border border-edge bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
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
                  className="rounded-lg border border-edge-strong bg-input p-4"
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
                      <span className="text-muted">Events</span>
                      <span className="font-medium text-foreground">{stats.events}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">Sessions</span>
                      <span className="font-medium text-foreground">{stats.sessions.size}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-edge-strong">
                      <p className="text-muted mb-1">Top actions</p>
                      {topActions.map(([action, count]) => (
                        <div key={action} className="flex justify-between">
                          <span className="font-mono text-secondary">{action}</span>
                          <span className="text-muted">{count}</span>
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
        <div className="rounded-xl border border-edge bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Event Breakdown
          </h2>
          {sortedTypes.length === 0 ? (
            <p className="text-sm text-muted">
              No events yet. Interact with the prototype to see data.
            </p>
          ) : (
            <div className="space-y-2">
              {sortedTypes.map(([type, count]) => {
                const pct = Math.round((count / allEvents.length) * 100);
                return (
                  <div key={type}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-mono text-secondary">{type}</span>
                      <span className="text-muted">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-input">
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
        <div className="lg:col-span-2 rounded-xl border border-edge bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold text-foreground">
            Live Event Stream
          </h2>
          {streamEvents.length === 0 ? (
            <p className="text-sm text-muted">
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
              {streamEvents.map((event) => {
                const colorClass =
                  EVENT_COLORS[event.type] ||
                  "bg-subtle/30 text-secondary border-edge-strong/30";
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 rounded-lg border border-edge bg-background/50 p-3"
                  >
                    <span
                      className={`mt-0.5 shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${colorClass}`}
                    >
                      {event.type}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs text-muted">
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
                          <pre className="mt-1 text-[11px] leading-relaxed text-faint truncate">
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

      {/* Confirm dialog */}
      {confirmAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setConfirmAction(null);
              setConfirmMessage("");
            }
          }}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-edge-strong bg-card p-6 shadow-2xl"
            tabIndex={-1}
            ref={(el) => el?.focus()}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setConfirmAction(null);
                setConfirmMessage("");
              }
              if (e.key === "Enter") {
                confirmAction();
                setConfirmAction(null);
                setConfirmMessage("");
              }
            }}
          >
            <h2 className="text-sm font-semibold text-foreground">Confirm</h2>
            <p className="mt-2 text-sm text-secondary">{confirmMessage}</p>
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmAction(null);
                  setConfirmMessage("");
                }}
                className="rounded-lg border border-edge-strong px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmAction();
                  setConfirmAction(null);
                  setConfirmMessage("");
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
