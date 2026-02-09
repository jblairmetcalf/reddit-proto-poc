"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
import { VARIANT_PRESETS } from "@/lib/variants";

interface Study {
  id: string;
  name: string;
  description: string;
  status: "draft" | "active" | "completed";
  prototypeVariant: string;
  createdAt?: { seconds: number };
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-zinc-700 text-zinc-300",
  active: "bg-green-500/20 text-green-400",
  completed: "bg-blue-500/20 text-blue-400",
};

export default function StudiesPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [variant, setVariant] = useState("default");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "studies"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setStudies(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Study, "id">) }))
      );
    });
    return () => unsub();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await addDoc(collection(db, "studies"), {
        name: name.trim(),
        description: description.trim(),
        status: "draft",
        prototypeVariant: variant,
        createdAt: serverTimestamp(),
      });
      setName("");
      setDescription("");
      setVariant("default");
      setShowCreate(false);
    } catch (err) {
      console.error("Failed to create study:", err);
    } finally {
      setCreating(false);
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
          onClick={() => setShowCreate(!showCreate)}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
        >
          {showCreate ? "Cancel" : "New Study"}
        </button>
      </header>

      {/* Create form */}
      {showCreate && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">
            Create Study
          </h2>
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
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">
                Prototype Variant
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
            <button
              onClick={handleCreate}
              disabled={!name.trim() || creating}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Creating..." : "Create Study"}
            </button>
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
                href={`/uxr/studies/${study.id}`}
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
                  Variant: {study.prototypeVariant}
                  {study.createdAt &&
                    ` · Created ${new Date(study.createdAt.seconds * 1000).toLocaleDateString()}`}
                </p>
              </Link>
              <button
                onClick={() => handleDelete(study.id)}
                className="ml-4 rounded-lg px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
