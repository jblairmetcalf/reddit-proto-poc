"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp,
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
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editStudyId, setEditStudyId] = useState("");
  const [editStatus, setEditStatus] = useState<Participant["status"]>("invited");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub1 = onSnapshot(collection(db, "participants"), (snap) => {
      const docs = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Participant, "id">),
      }));
      docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setParticipants(docs);
    });

    const unsub2 = onSnapshot(collection(db, "studies"), (snap) => {
      const docs = snap.docs.map((d) => {
        const data = d.data() as { name: string; prototypeVariant?: string };
        return { id: d.id, name: data.name, prototypeVariant: data.prototypeVariant };
      });
      setStudies(docs);
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

  const openEdit = (p: Participant) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditEmail(p.email || "");
    setEditStudyId(p.studyId);
    setEditStatus(p.status);
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditEmail("");
    setEditStudyId("");
    setEditStatus("invited");
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "participants", editingId), {
        name: editName.trim(),
        email: editEmail.trim() || null,
        studyId: editStudyId,
        status: editStatus,
      });
      closeEdit();
    } catch (err) {
      console.error("Failed to update participant:", err);
    } finally {
      setSaving(false);
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
          onClick={() => setShowInvite(true)}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
        >
          Invite Participant
        </button>
      </header>

      {/* Invite dialog */}
      {showInvite && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowInvite(false);
              setName("");
              setEmail("");
              setStudyId("");
            }
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Invite Participant
              </h2>
              <button
                onClick={() => {
                  setShowInvite(false);
                  setName("");
                  setEmail("");
                  setStudyId("");
                }}
                className="rounded-lg px-2 py-1 text-xs text-zinc-500 transition-colors hover:text-white"
              >
                &times;
              </button>
            </div>
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
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  onClick={() => {
                    setShowInvite(false);
                    setName("");
                    setEmail("");
                    setStudyId("");
                  }}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={!name.trim() || !studyId || creating}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Generating link..." : "Generate Invite Link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Participant dialog */}
      {editingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEdit();
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Edit Participant
              </h2>
              <button
                onClick={closeEdit}
                className="rounded-lg px-2 py-1 text-xs text-zinc-500 transition-colors hover:text-white"
              >
                &times;
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
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
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="participant@example.com"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">
                    Study
                  </label>
                  <select
                    value={editStudyId}
                    onChange={(e) => setEditStudyId(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="">No study</option>
                    {studies.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as Participant["status"])
                    }
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                  >
                    <option value="invited">Invited</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="timed_out">Timed Out</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  onClick={closeEdit}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!editName.trim() || saving}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Update Participant"}
                </button>
              </div>
            </div>
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
                  <button
                    onClick={() => openEdit(p)}
                    className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-orange-500/10 hover:text-orange-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
