"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { VARIANT_PRESETS } from "@/lib/variants";

interface Prototyper {
  name: string;
  role: string;
  email: string;
}

interface Prototype {
  id: string;
  title: string;
  description: string;
  status: "draft" | "in-progress" | "complete";
  variant: string;
  url: string;
  fileName: string;
  modifiedAt?: { seconds: number };
  createdAt?: { seconds: number };
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-zinc-700 text-zinc-300",
  "in-progress": "bg-amber-500/20 text-amber-400",
  complete: "bg-green-500/20 text-green-400",
};

const ROLE_STYLES: Record<string, string> = {
  "Lead Prototyper": "bg-orange-500/20 text-orange-400",
  "UX Engineer": "bg-violet-500/20 text-violet-400",
  "Interaction Designer": "bg-sky-500/20 text-sky-400",
};

export default function PrototyperDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [prototyper, setPrototyper] = useState<Prototyper | null>(null);
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "in-progress" | "complete">("draft");
  const [protoType, setProtoType] = useState<"default" | "link" | "file">("default");
  const [variant, setVariant] = useState("default");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  // Listen to prototyper doc
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "prototypers", id),
      (snap) => {
        if (snap.exists()) {
          setPrototyper(snap.data() as Prototyper);
        }
      },
      (err) => console.error("Prototyper doc snapshot error:", err)
    );
    return () => unsub();
  }, [id]);

  // Listen to prototypes sub-collection
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "prototypers", id, "prototypes"),
      (snap) => {
        const docs = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Prototype, "id">),
        }));
        docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        setPrototypes(docs);
      }
    );
    return () => unsub();
  }, [id]);

  function resetForm() {
    setTitle("");
    setDescription("");
    setStatus("draft");
    setProtoType("default");
    setVariant("default");
    setUrl("");
    setFileName("");
    setEditingId(null);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  function openEdit(proto: Prototype) {
    setTitle(proto.title);
    setDescription(proto.description);
    setStatus(proto.status);
    setProtoType(proto.url ? "link" : proto.fileName ? "file" : "default");
    setVariant(proto.variant);
    setUrl(proto.url);
    setFileName(proto.fileName);
    setEditingId(proto.id);
    setShowForm(true);
  }

  function closeForm() {
    resetForm();
    setShowForm(false);
  }

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        description: description.trim(),
        status,
        variant: protoType === "default" ? variant : "default",
        url: protoType === "link" ? url.trim() : "",
        fileName: protoType === "file" ? fileName : "",
        modifiedAt: serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "prototypers", id, "prototypes", editingId), data);
      } else {
        await addDoc(collection(db, "prototypers", id, "prototypes"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      closeForm();
    } catch (err) {
      console.error("Failed to save prototype:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (protoId: string) => {
    try {
      await deleteDoc(doc(db, "prototypers", id, "prototypes", protoId));
    } catch (err) {
      console.error("Failed to delete prototype:", err);
    }
  };

  const latestModified = prototypes.reduce<number | null>((latest, p) => {
    if (!p.modifiedAt) return latest;
    const ts = p.modifiedAt.seconds * 1000;
    return latest === null || ts > latest ? ts : latest;
  }, null);

  if (!prototyper) {
    return (
      <div className="min-h-screen bg-zinc-950 p-8">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <header className="mb-6">
        <Link
          href="/prototypers"
          className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-orange-400"
        >
          &larr; Prototypers
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                {prototyper.name}
              </h1>
              {prototyper.role && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${ROLE_STYLES[prototyper.role] || "bg-zinc-700 text-zinc-300"}`}
                >
                  {prototyper.role}
                </span>
              )}
            </div>
            {prototyper.email && (
              <p className="mt-1 text-sm text-zinc-400">{prototyper.email}</p>
            )}
          </div>
          <button
            onClick={openCreate}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
          >
            Add Prototype
          </button>
        </div>

        {/* Stats row */}
        <div className="mt-4 flex gap-6">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Prototypes
            </p>
            <p className="mt-1 text-lg font-bold text-white">
              {prototypes.length}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3">
            <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
              Latest Modified
            </p>
            <p className="mt-1 text-lg font-bold text-white">
              {latestModified
                ? new Date(latestModified).toLocaleDateString()
                : "\u2014"}
            </p>
          </div>
        </div>
      </header>

      {/* Create / Edit dialog */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                {editingId ? "Edit Prototype" : "Add Prototype"}
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
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Compact Feed Exploration"
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
                  placeholder="What does this prototype explore?"
                  rows={3}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "draft" | "in-progress" | "complete")
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="in-progress">In Progress</option>
                  <option value="complete">Complete</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-400">
                  Type
                </label>
                <div className="flex gap-2">
                  {([
                    { value: "default", label: "Coded Prototype" },
                    { value: "link", label: "Link" },
                    { value: "file", label: "Uploaded File" },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setProtoType(opt.value)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        protoType === opt.value
                          ? "border-orange-500 bg-orange-500/10 text-orange-400"
                          : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {protoType === "default" && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">
                    Variant
                  </label>
                  <select
                    value={variant}
                    onChange={(e) => setVariant(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                  >
                    {Object.values(VARIANT_PRESETS).map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {protoType === "link" && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">
                    URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              )}
              {protoType === "file" && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-zinc-400">
                    File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      setFileName(file ? file.name : "");
                    }}
                    className="w-full text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-700 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-300 file:cursor-pointer hover:file:bg-zinc-600"
                  />
                  {editingId && fileName && (
                    <p className="mt-1 text-[10px] text-zinc-600">
                      Current: {fileName}
                    </p>
                  )}
                </div>
              )}
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  onClick={closeForm}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!title.trim() || saving}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Prototype"
                      : "Add Prototype"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prototypes list */}
      {prototypes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
          <p className="text-sm text-zinc-500">
            No prototypes yet. Add one to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prototypes.map((proto) => (
            <div
              key={proto.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-semibold text-white">
                  {proto.title}
                </h3>
                <div className="ml-2 flex items-center gap-1">
                  <button
                    onClick={() => openEdit(proto)}
                    className="rounded-lg px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-orange-500/10 hover:text-orange-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setConfirmAction(() => () => handleDelete(proto.id));
                      setConfirmMessage(`Delete "${proto.title}"?`);
                    }}
                    className="rounded-lg px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {proto.description && (
                <p className="mt-1 text-xs text-zinc-500">
                  {proto.description}
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[proto.status] || STATUS_STYLES.draft}`}
                >
                  {proto.status}
                </span>
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                  {VARIANT_PRESETS[proto.variant]?.label ?? proto.variant}
                </span>
              </div>
              {proto.modifiedAt && (
                <p className="mt-3 text-[10px] text-zinc-600">
                  Modified{" "}
                  {new Date(
                    proto.modifiedAt.seconds * 1000
                  ).toLocaleDateString()}
                </p>
              )}
              {proto.url ? (
                <a
                  href={proto.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-orange-500 hover:text-orange-400"
                >
                  Preview &rarr;
                </a>
              ) : proto.fileName ? (
                <p className="mt-3 text-[10px] text-zinc-600">
                  File: {proto.fileName}
                </p>
              ) : (
                <Link
                  href={`/prototype?variant=${proto.variant}`}
                  target="_blank"
                  className="mt-3 inline-block rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-orange-500 hover:text-orange-400"
                >
                  Preview
                </Link>
              )}
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
