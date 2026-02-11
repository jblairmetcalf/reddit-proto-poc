"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

interface Study {
  id: string;
  name: string;
  description: string;
  status: "draft" | "active" | "completed";
  prototypeId?: string;
  prototyperId?: string;
  prototypeTitle?: string;
  prototypeVariant?: string;
  createdAt?: { seconds: number };
}

interface Prototyper {
  id: string;
  name: string;
}

interface Prototype {
  id: string;
  prototyperId: string;
  prototyperName: string;
  title: string;
  variant: string;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-subtle text-secondary",
  active: "bg-green-500/20 text-green-400",
  completed: "bg-blue-500/20 text-blue-400",
};

export default function StudiesPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProtoKey, setSelectedProtoKey] = useState("");
  const [status, setStatus] = useState<"draft" | "active" | "completed">("draft");
  const [saving, setSaving] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  // Listen to studies
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "studies"), (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Study, "id">) }));
      docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setStudies(docs);
    });
    return () => unsub();
  }, []);

  // Listen to prototypers + their prototypes
  const [prototypers, setPrototypers] = useState<Prototyper[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "prototypers"), (snap) => {
      setPrototypers(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Prototyper, "id">) }))
      );
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (prototypers.length === 0) {
      setPrototypes([]);
      return;
    }

    const protosMap = new Map<string, Prototype[]>();
    const unsubs: (() => void)[] = [];

    for (const p of prototypers) {
      const unsub = onSnapshot(
        collection(db, "prototypers", p.id, "prototypes"),
        (snap) => {
          protosMap.set(
            p.id,
            snap.docs.map((d) => ({
              id: d.id,
              prototyperId: p.id,
              prototyperName: p.name,
              ...(d.data() as { title: string; variant: string }),
            }))
          );
          setPrototypes(Array.from(protosMap.values()).flat());
        }
      );
      unsubs.push(unsub);
    }

    return () => unsubs.forEach((u) => u());
  }, [prototypers]);

  function resetForm() {
    setName("");
    setDescription("");
    setSelectedProtoKey("");
    setStatus("draft");
    setEditingId(null);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(study: Study) {
    setName(study.name);
    setDescription(study.description);
    setSelectedProtoKey(
      study.prototypeId && study.prototyperId
        ? `${study.prototyperId}:${study.prototypeId}`
        : ""
    );
    setStatus(study.status);
    setEditingId(study.id);
    setShowForm(true);
  }

  function closeForm() {
    resetForm();
    setShowForm(false);
  }

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      // Parse selected prototype
      const selectedProto = selectedProtoKey
        ? prototypes.find((p) => `${p.prototyperId}:${p.id}` === selectedProtoKey)
        : null;

      const data: Record<string, unknown> = {
        name: name.trim(),
        description: description.trim(),
        prototypeId: selectedProto?.id ?? null,
        prototyperId: selectedProto?.prototyperId ?? null,
        prototypeTitle: selectedProto?.title ?? null,
        prototypeVariant: selectedProto?.variant ?? null,
      };

      if (editingId) {
        data.status = status;
        await updateDoc(doc(db, "studies", editingId), data);
      } else {
        data.status = "draft";
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, "studies"), data);
      }
      closeForm();
    } catch (err) {
      console.error("Failed to save study:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "studies", id));
    } catch (err) {
      console.error("Failed to delete study:", err);
    }
  };

  return (
    <div className="p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Studies</h1>
          <p className="mt-1 text-sm text-secondary">
            Create and manage UX research studies
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
        >
          New Study
        </button>
      </header>

      {/* Create / Edit dialog */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border border-edge-strong bg-card p-6 shadow-2xl"
            onKeyDown={(e) => {
              if (e.key === "Escape") closeForm();
              if (e.key === "Enter" && e.target instanceof HTMLElement && e.target.tagName !== "TEXTAREA") {
                e.preventDefault();
                handleSave();
              }
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                {editingId ? "Edit Study" : "Create Study"}
              </h2>
              <button
                onClick={closeForm}
                className="rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:text-foreground"
              >
                &times;
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-secondary">
                  Study Name
                </label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Feed Sorting Experiment"
                  className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-secondary">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you testing?"
                  rows={3}
                  className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none resize-none"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-secondary">
                    Prototype
                  </label>
                  <select
                    value={selectedProtoKey}
                    onChange={(e) => setSelectedProtoKey(e.target.value)}
                    className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none"
                  >
                    <option value="">Select a prototype...</option>
                    {prototypers.map((p) => {
                      const protos = prototypes.filter(
                        (proto) => proto.prototyperId === p.id
                      );
                      if (protos.length === 0) return null;
                      return (
                        <optgroup key={p.id} label={p.name}>
                          {protos.map((proto) => (
                            <option
                              key={proto.id}
                              value={`${proto.prototyperId}:${proto.id}`}
                            >
                              {proto.title}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                  {prototypes.length === 0 && (
                    <p className="mt-1 text-xs text-faint">
                      Add prototypes from the Prototypers page first.
                    </p>
                  )}
                </div>
                {editingId && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-secondary">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as "draft" | "active" | "completed")
                      }
                      className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  onClick={closeForm}
                  className="rounded-lg border border-edge-strong px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!name.trim() || saving}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Study"
                      : "Create Study"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Studies list */}
      {studies.length === 0 ? (
        <div className="rounded-xl border border-dashed border-edge p-12 text-center">
          <p className="text-sm text-muted">
            No studies yet. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {studies.map((study) => (
            <Link
              key={study.id}
              href={`/user-research/studies/${study.id}`}
              className="group rounded-xl border border-edge bg-card p-6 transition-colors hover:border-orange-600"
            >
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-orange-400">
                  {study.name}
                </h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[study.status] || STATUS_STYLES.draft}`}
                >
                  {study.status}
                </span>
              </div>
              {study.description && (
                <p className="mt-2 text-sm text-secondary">
                  {study.description}
                </p>
              )}
              <p className="mt-2 text-xs text-muted">
                {study.prototypeTitle
                  ? `Prototype: ${study.prototypeTitle}`
                  : "No prototype selected"}
                {study.createdAt &&
                  ` · Created ${new Date(study.createdAt.seconds * 1000).toLocaleDateString()}`}
              </p>
            </Link>
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
    </div>
  );
}
