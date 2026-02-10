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
  draft: "bg-zinc-700 text-zinc-300",
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
          <h1 className="text-2xl font-bold text-white">Studies</h1>
          <p className="mt-1 text-sm text-zinc-400">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                {editingId ? "Edit Study" : "Create Study"}
              </h2>
              <button
                onClick={closeForm}
                className="rounded-lg px-2 py-1 text-xs text-zinc-500 transition-colors hover:text-white"
              >
                &times;
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">
                  Study Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Feed Sorting Experiment"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you testing?"
                  rows={3}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none resize-none"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">
                    Prototype
                  </label>
                  <select
                    value={selectedProtoKey}
                    onChange={(e) => setSelectedProtoKey(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
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
                    <p className="mt-1 text-xs text-zinc-600">
                      Add prototypes from the Prototypers page first.
                    </p>
                  )}
                </div>
                {editingId && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-400">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as "draft" | "active" | "completed")
                      }
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
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
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
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
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
          <p className="text-sm text-zinc-500">
            No studies yet. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {studies.map((study) => (
            <div
              key={study.id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700"
            >
              <Link
                href={`/user-research/studies/${study.id}`}
                className="min-w-0 flex-1"
              >
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-white">
                    {study.name}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[study.status] || STATUS_STYLES.draft}`}
                  >
                    {study.status}
                  </span>
                </div>
                {study.description && (
                  <p className="mt-1 text-xs text-zinc-500 truncate">
                    {study.description}
                  </p>
                )}
                <p className="mt-1 text-[10px] text-zinc-600">
                  {study.prototypeTitle
                    ? `Prototype: ${study.prototypeTitle}`
                    : "No prototype selected"}
                  {study.createdAt &&
                    ` · Created ${new Date(study.createdAt.seconds * 1000).toLocaleDateString()}`}
                </p>
              </Link>
              <div className="ml-4 flex items-center gap-1">
                <button
                  onClick={() => openEdit(study)}
                  className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-orange-500/10 hover:text-orange-400"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setConfirmAction(() => () => handleDelete(study.id));
                    setConfirmMessage(`Delete "${study.name}"?`);
                  }}
                  className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm dialog */}
      {confirmAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setConfirmAction(null);
              setConfirmMessage("");
            }
          }}
        >
          <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <h2 className="text-sm font-semibold text-white">Confirm Delete</h2>
            <p className="mt-2 text-sm text-zinc-400">{confirmMessage}</p>
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setConfirmAction(null);
                  setConfirmMessage("");
                }}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
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
