"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

interface Participant {
  id: string;
  name: string;
  email?: string;
  persona?: string;
  userType?: string;
  studyId: string;
  status: "invited" | "active" | "completed" | "timed_out";
  tokenUrl?: string;
  createdAt?: { seconds: number };
}

interface Study {
  id: string;
  name: string;
  prototypeVariant?: string;
}

const STATUS_STYLES: Record<string, string> = {
  invited: "bg-amber-500/20 text-amber-400",
  active: "bg-green-500/20 text-green-400",
  completed: "bg-blue-500/20 text-blue-400",
  timed_out: "bg-red-500/20 text-red-400",
};

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studyId, setStudyId] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const pq = query(
      collection(db, "participants"),
      orderBy("createdAt", "desc")
    );
    const unsub1 = onSnapshot(pq, (snap) => {
      setParticipants(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Participant, "id">),
        }))
      );
    });

    const sq = query(collection(db, "studies"), orderBy("createdAt", "desc"));
    const unsub2 = onSnapshot(sq, (snap) => {
      setStudies(
        snap.docs.map((d) => {
          const data = d.data() as { name: string; prototypeVariant?: string };
          return { id: d.id, name: data.name, prototypeVariant: data.prototypeVariant };
        })
      );
    });

    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  const handleInvite = async () => {
    if (!name.trim() || !studyId) return;
    setCreating(true);

    try {
      // Generate participant token with study's variant
      const selectedStudy = studies.find((s) => s.id === studyId);
      const tokenRes = await fetch("/api/auth/participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: `p-${Date.now()}`,
          studyId,
          name: name.trim(),
          prototypeVariant: selectedStudy?.prototypeVariant,
        }),
      });

      if (!tokenRes.ok) {
        console.error("Token generation failed:", tokenRes.status);
        alert("Failed to generate invite link. Please try again.");
        return;
      }

      const tokenData = await tokenRes.json();

      await addDoc(collection(db, "participants"), {
        name: name.trim(),
        email: email.trim() || null,
        studyId,
        status: "invited",
        tokenUrl: tokenData.url,
        createdAt: serverTimestamp(),
      });

      setName("");
      setEmail("");
      setStudyId("");
      setShowInvite(false);
    } catch (err) {
      console.error("Failed to invite participant:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "participants", id));
    } catch (err) {
      console.error("Failed to delete participant:", err);
    }
  };

  const handleCopyLink = async (participant: Participant) => {
    if (!participant.tokenUrl) return;
    try {
      await navigator.clipboard.writeText(participant.tokenUrl);
      setCopiedId(participant.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      prompt("Copy this link:", participant.tokenUrl);
    }
  };

  const getStudyName = (sid: string) =>
    studies.find((s) => s.id === sid)?.name ?? sid;

  return (
    <div className="p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Participants</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Manage participants and generate invite links
          </p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
        >
          {showInvite ? "Cancel" : "Invite Participant"}
        </button>
      </header>

      {/* Invite form */}
      {showInvite && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">
            Invite Participant
          </h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Blair Metcalf"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">
                Email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="participant@example.com"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">
                Study
              </label>
              <select
                value={studyId}
                onChange={(e) => setStudyId(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
              >
                <option value="">Select a study...</option>
                {studies.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {studies.length === 0 && (
                <p className="mt-1 text-xs text-zinc-600">
                  Create a study first in the Studies tab.
                </p>
              )}
            </div>
            <button
              onClick={handleInvite}
              disabled={!name.trim() || !studyId || creating}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Generating link..." : "Generate Invite Link"}
            </button>
          </div>
        </div>
      )}

      {/* Participants list */}
      {participants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
          <p className="text-sm text-zinc-500">
            No participants yet. Invite one to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {participants.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-white">
                      {p.name}
                    </h3>
                    {p.persona && (
                      <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-400">
                        {p.persona}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[p.status] || STATUS_STYLES.invited}`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Study: {getStudyName(p.studyId)}
                    {p.userType && ` · ${p.userType}`}
                    {p.email && ` · ${p.email}`}
                    {p.createdAt &&
                      ` · ${new Date(p.createdAt.seconds * 1000).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  {p.tokenUrl && (
                    <button
                      onClick={() => handleCopyLink(p)}
                      className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-orange-500 hover:text-orange-400"
                    >
                      {copiedId === p.id ? "Copied!" : "Copy Link"}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {p.tokenUrl && (
                <div className="mt-2 overflow-hidden rounded-lg bg-zinc-950 px-3 py-2">
                  <code className="text-[11px] text-zinc-600 break-all">
                    {p.tokenUrl}
                  </code>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
