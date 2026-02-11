"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Toast from "@/components/Toast";
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

const STATUS_STYLES: Record<string, string> = {
  invited: "bg-amber-500/20 text-amber-400",
  viewed: "bg-cyan-500/20 text-cyan-400",
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
  const [creating, setCreating] = useState(false);
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

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
      {showInvite && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowInvite(false);
              setName("");
              setEmail("");
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border border-edge-strong bg-card p-6 shadow-2xl"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setShowInvite(false);
                setName("");
                setEmail("");
              }
              if (e.key === "Enter" && e.target instanceof HTMLElement && e.target.tagName !== "TEXTAREA") {
                e.preventDefault();
                handleAdd();
              }
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Add Participant
              </h2>
              <button
                onClick={() => {
                  setShowInvite(false);
                  setName("");
                  setEmail("");
                }}
                className="rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:text-foreground"
              >
                &times;
              </button>
            </div>
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
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  onClick={() => {
                    setShowInvite(false);
                    setName("");
                    setEmail("");
                  }}
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
            </div>
          </div>
        </div>
      )}

      {/* Edit Participant dialog */}
      {editingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) confirmCloseEdit();
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border border-edge-strong bg-card p-6 shadow-2xl"
            onKeyDown={(e) => {
              if (e.key === "Escape") confirmCloseEdit();
              if (e.key === "Enter" && e.target instanceof HTMLElement && e.target.tagName !== "TEXTAREA") {
                e.preventDefault();
                handleSaveEdit();
              }
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Edit Participant
              </h2>
              <button
                onClick={confirmCloseEdit}
                className="rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:text-foreground"
              >
                &times;
              </button>
            </div>
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
            </div>
          </div>
        </div>
      )}

      {/* Participants list */}
      {participants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-edge p-12 text-center">
          <p className="text-sm text-muted">
            No participants yet. Add one to get started.
          </p>
        </div>
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
                          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${STATUS_STYLES[status] || STATUS_STYLES.invited}`}>{status}</span>
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
                      setConfirmAction(() => () => handleDelete(p.id));
                      setConfirmMessage(`Delete "${p.name}"?`);
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
            <h2 className="text-sm font-semibold text-foreground">Confirm Delete</h2>
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
      {toast && (
        <Toast message={toast.message} onUndo={toast.onUndo} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}
