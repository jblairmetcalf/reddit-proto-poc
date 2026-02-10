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
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { VARIANT_PRESETS } from "@/lib/variants";

interface Prototype {
  id: string;
  title: string;
  description: string;
  status: string;
  variant: string;
  url: string;
  fileName: string;
}

interface Prototyper {
  id: string;
  name: string;
  role: string;
  email: string;
  createdAt?: { seconds: number };
}

const ROLE_STYLES: Record<string, string> = {
  "Lead Prototyper": "bg-orange-500/20 text-orange-400",
  "UX Engineer": "bg-violet-500/20 text-violet-400",
  "Interaction Designer": "bg-sky-500/20 text-sky-400",
};

export default function PrototypersPage() {
  const [prototypers, setPrototypers] = useState<Prototyper[]>([]);
  const [protoMap, setProtoMap] = useState<Record<string, Prototype[]>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "prototypers"), (snap) => {
      const docs = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Prototyper, "id">),
      }));
      docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setPrototypers(docs);
    });
    return () => unsub();
  }, []);

  // Listen for prototypes per prototyper
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    for (const p of prototypers) {
      const unsub = onSnapshot(
        collection(db, "prototypers", p.id, "prototypes"),
        (snap) => {
          const protos = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Prototype, "id">),
          }));
          setProtoMap((prev) => ({ ...prev, [p.id]: protos }));
        }
      );
      unsubs.push(unsub);
    }

    return () => unsubs.forEach((u) => u());
  }, [prototypers]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await addDoc(collection(db, "prototypers"), {
        name: name.trim(),
        role: role.trim(),
        email: email.trim(),
        createdAt: serverTimestamp(),
      });
      setName("");
      setRole("");
      setEmail("");
      setShowCreate(false);
    } catch (err) {
      console.error("Failed to create prototyper:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const protoSnap = await getDocs(
        collection(db, "prototypers", id, "prototypes")
      );
      await Promise.all(
        protoSnap.docs.map((d) =>
          deleteDoc(doc(db, "prototypers", id, "prototypes", d.id))
        )
      );
      await deleteDoc(doc(db, "prototypers", id));
    } catch (err) {
      console.error("Failed to delete prototyper:", err);
    }
  };

  // Filter prototypers by search across all metadata
  const q = search.trim().toLowerCase();
  const filtered = q
    ? prototypers.filter((p) => {
        const protos = protoMap[p.id] || [];
        // Match prototyper fields
        const prototyperMatch = [p.name, p.role, p.email]
          .filter(Boolean)
          .some((v) => v.toLowerCase().includes(q));
        if (prototyperMatch) return true;
        // Match any prototype fields
        return protos.some((proto) =>
          [
            proto.title,
            proto.description,
            proto.status,
            proto.variant,
            VARIANT_PRESETS[proto.variant]?.label,
            proto.url,
            proto.fileName,
          ]
            .filter(Boolean)
            .some((v) => v!.toLowerCase().includes(q))
        );
      })
    : prototypers;

  // Build matching prototype highlights for search
  function getMatchingProtos(prototyperId: string): Prototype[] {
    if (!q) return [];
    const protos = protoMap[prototyperId] || [];
    // If the prototyper itself matches, don't highlight individual protos
    const p = prototypers.find((x) => x.id === prototyperId);
    if (
      p &&
      [p.name, p.role, p.email]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q))
    ) {
      return [];
    }
    return protos.filter((proto) =>
      [
        proto.title,
        proto.description,
        proto.status,
        proto.variant,
        VARIANT_PRESETS[proto.variant]?.label,
        proto.url,
        proto.fileName,
      ]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <header className="mb-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-orange-400"
        >
          &larr; Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Prototypers</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Manage prototypers and their prototype portfolios
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
          >
            Add Prototyper
          </button>
        </div>
      </header>

      {/* Add Prototyper dialog */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreate(false);
              setName("");
              setRole("");
              setEmail("");
            }
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Add Prototyper
              </h2>
              <button
                onClick={() => {
                  setShowCreate(false);
                  setName("");
                  setRole("");
                  setEmail("");
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
                  Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Lead Prototyper"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prototyper@example.com"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setName("");
                    setRole("");
                    setEmail("");
                  }}
                  className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!name.trim() || creating}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? "Adding..." : "Add Prototyper"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, role, email, prototype title, variant, status..."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
        />
      </div>

      {/* Prototypers grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
          <p className="text-sm text-zinc-500">
            {q
              ? `No prototypers matching "${search.trim()}".`
              : "No prototypers yet. Add one to get started."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const protos = protoMap[p.id] || [];
            const matchingProtos = getMatchingProtos(p.id);
            return (
              <div
                key={p.id}
                className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-700"
              >
                <Link href={`/prototypers/${p.id}`} className="block">
                  <h3 className="text-sm font-semibold text-white group-hover:text-orange-400">
                    {p.name}
                  </h3>
                  {p.role && (
                    <span
                      className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${ROLE_STYLES[p.role] || "bg-zinc-700 text-zinc-300"}`}
                    >
                      {p.role}
                    </span>
                  )}
                  <p className="mt-3 text-xs text-zinc-500">
                    {protos.length} prototype
                    {protos.length !== 1 ? "s" : ""}
                  </p>
                  {p.email && (
                    <p className="mt-1 text-[10px] text-zinc-600">{p.email}</p>
                  )}
                  {/* Show matching prototypes when searching */}
                  {matchingProtos.length > 0 && (
                    <div className="mt-3 space-y-1.5 border-t border-zinc-800 pt-3">
                      <p className="text-[10px] font-medium uppercase text-zinc-600">
                        Matching prototypes
                      </p>
                      {matchingProtos.map((proto) => (
                        <div
                          key={proto.id}
                          className="rounded-lg bg-zinc-800 px-2.5 py-1.5"
                        >
                          <p className="text-xs text-zinc-300">
                            {proto.title}
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            {proto.status}
                            {" · "}
                            {VARIANT_PRESETS[proto.variant]?.label ??
                              proto.variant}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Link>
                <button
                  onClick={() => {
                    setConfirmAction(() => () => handleDelete(p.id));
                    setConfirmMessage(`Delete "${p.name}" and all their prototypes?`);
                  }}
                  className="mt-3 rounded-lg px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            );
          })}
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
