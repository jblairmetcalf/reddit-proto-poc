"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Toast from "@/components/infrastructure/Toast";
import { Dialog, ConfirmDialog, StatusBadge, EmptyState, PARTICIPANT_STATUS_STYLES } from "@/components/infrastructure";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  deleteField,
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
  studyStatus?: Record<string, string>;
  tokenUrl?: string;
  createdAt?: { seconds: number };
}

interface Study {
  id: string;
  name: string;
  prototypeVariant?: string;
}

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [creating, setCreating] = useState(false);
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmState, setConfirmState] = useState<{ message: string; action: () => void } | null>(null);

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

  const handleAdd = async () => {
    if (!name.trim()) return;
    setCreating(true);

    try {
      await addDoc(collection(db, "participants"), {
        name: name.trim(),
        email: email.trim() || null,
        createdAt: serverTimestamp(),
      });

      setName("");
      setEmail("");
      setShowInvite(false);
    } catch (err) {
      console.error("Failed to add participant:", err);
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

  const [origEdit, setOrigEdit] = useState({ name: "", email: "" });
  const [toast, setToast] = useState<{ message: string; onUndo?: () => void } | null>(null);

  const openEdit = (p: Participant) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditEmail(p.email || "");
    setOrigEdit({ name: p.name, email: p.email || "" });
  };

  const editHasChanges = editName !== origEdit.name || editEmail !== origEdit.email;

  const closeEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditEmail("");
  };

  const confirmCloseEdit = () => {
    if (editHasChanges && !window.confirm("You have unsaved changes. Discard them?")) return;
    closeEdit();
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    setSaving(true);
    const prevId = editingId;
    const prev = { ...origEdit };
    try {
      await updateDoc(doc(db, "participants", editingId), {
        name: editName.trim(),
        email: editEmail.trim() || null,
      });
      setToast({
        message: `Updated "${editName.trim()}"`,
        onUndo: () => {
          updateDoc(doc(db, "participants", prevId), {
            name: prev.name,
            email: prev.email || null,
          }).catch(console.error);
        },
      });
      closeEdit();
    } catch (err) {
      console.error("Failed to update participant:", err);
    } finally {
      setSaving(false);
    }
  };

  // Clean up stale study references from participants
  useEffect(() => {
    if (studies.length === 0 || participants.length === 0) return;
    const studyIds = new Set(studies.map((s) => s.id));
    for (const p of participants) {
      if (!p.studyStatus) continue;
      const staleKeys = Object.keys(p.studyStatus).filter((sid) => !studyIds.has(sid));
      if (staleKeys.length > 0) {
        const updates: Record<string, unknown> = {};
        for (const key of staleKeys) {
          updates[`studyStatus.${key}`] = deleteField();
        }
        updateDoc(doc(db, "participants", p.id), updates).catch(console.error);
      }
    }
  }, [studies, participants]);

  const getStudyName = (sid: string) =>
    studies.find((s) => s.id === sid)?.name ?? sid;

  return (
    <div className="p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Participants</h1>
          <p className="mt-1 text-sm text-secondary">
            Manage participants
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
        >
          Add Participant
        </button>
      </header>

      {/* Invite dialog */}
      <Dialog
        open={showInvite}
        onClose={() => { setShowInvite(false); setName(""); setEmail(""); }}
        title="Add Participant"
        onSubmit={handleAdd}
        footer={
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              onClick={() => { setShowInvite(false); setName(""); setEmail(""); }}
              className="rounded-lg border border-edge-strong px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!name.trim() || creating}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Adding..." : "Add Participant"}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">
              Name
            </label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Blair Metcalf"
              className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">
              Email (optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="participant@example.com"
              className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>
      </Dialog>

      {/* Edit Participant dialog */}
      <Dialog
        open={!!editingId}
        onClose={confirmCloseEdit}
        title="Edit Participant"
        onSubmit={handleSaveEdit}
        footer={
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              onClick={confirmCloseEdit}
              className="rounded-lg border border-edge-strong px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={!editName.trim() || saving || !editHasChanges}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Update Participant"}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">
              Name
            </label>
            <input
              autoFocus
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="e.g., Blair Metcalf"
              className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">
              Email (optional)
            </label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="participant@example.com"
              className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
            />
          </div>
        </div>
      </Dialog>

      {/* Participants list */}
      {participants.length === 0 ? (
        <EmptyState message="No participants yet. Add one to get started." />
      ) : (
        <div className="space-y-3">
          {participants.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-edge bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-foreground">
                      {p.name}
                    </h3>
                    {p.persona && (
                      <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-400">
                        {p.persona}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {[p.email, p.createdAt && new Date(p.createdAt.seconds * 1000).toLocaleDateString()].filter(Boolean).join(" · ")}
                  </p>
                  {p.studyStatus && Object.keys(p.studyStatus).length > 0 && (
                    <div className="mt-1.5">
                      {Object.entries(p.studyStatus).map(([sid, status]) => (
                        <div key={sid} className="flex items-center gap-1.5 mt-0.5 text-xs">
                          <Link href={`/user-research/studies/${sid}`} className="text-secondary hover:text-orange-400 transition-colors">{getStudyName(sid)}</Link>
                          <StatusBadge status={status} styleMap={PARTICIPANT_STATUS_STYLES} size="sm" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <button
                    onClick={() => openEdit(p)}
                    className="rounded-lg px-3 py-1.5 text-xs text-muted transition-colors hover:bg-orange-500/10 hover:text-orange-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setConfirmState({ message: `Delete "${p.name}"?`, action: () => handleDelete(p.id) });
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!confirmState}
        onClose={() => setConfirmState(null)}
        onConfirm={() => confirmState?.action()}
        message={confirmState?.message ?? ""}
      />
      {toast && (
        <Toast message={toast.message} onUndo={toast.onUndo} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}
