"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { VARIANT_PRESETS } from "@/lib/variants";
import { ConfirmDialog, StatusBadge, EmptyState, ROLE_STYLES } from "@/components/infrastructure";

interface Prototype {
  id: string;
  title: string;
  description: string;
  status: string;
  variant: string;
  url: string;
  fileName: string;
  fileUrl: string;
  modifiedAt?: { seconds: number };
  createdAt?: { seconds: number };
}

interface Prototyper {
  id: string;
  name: string;
  role: string;
  email: string;
  createdAt?: { seconds: number };
}

export default function PrototypersPage() {
  const [prototypers, setPrototypers] = useState<Prototyper[]>([]);
  const [protoMap, setProtoMap] = useState<Record<string, Prototype[]>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmState, setConfirmState] = useState<{ message: string; action: () => void } | null>(null);

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
        protoSnap.docs.map(async (d) => {
          const data = d.data() as { fileUrl?: string };
          if (data.fileUrl) {
            await deleteObject(ref(storage, data.fileUrl)).catch(() => {});
          }
          await deleteDoc(doc(db, "prototypers", id, "prototypes", d.id));
        })
      );
      await deleteDoc(doc(db, "prototypers", id));
    } catch (err) {
      console.error("Failed to delete prototyper:", err);
    }
  };

  // Latest prototype timestamp per prototyper
  function latestProtoTimestamp(prototyperId: string): number {
    const protos = protoMap[prototyperId] || [];
    return protos.reduce((latest, p) => {
      const ts = p.modifiedAt?.seconds ?? p.createdAt?.seconds ?? 0;
      return ts > latest ? ts : latest;
    }, 0);
  }

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

  // Sort by most recent prototype change, then by prototyper createdAt
  filtered.sort((a, b) => {
    const aTs = latestProtoTimestamp(a.id) || (a.createdAt?.seconds ?? 0);
    const bTs = latestProtoTimestamp(b.id) || (b.createdAt?.seconds ?? 0);
    return bTs - aTs;
  });

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
    <div className="min-h-screen bg-background p-8">
      <header className="mb-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-orange-400"
        >
          &larr; Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Prototypers</h1>
            <p className="mt-1 text-sm text-secondary">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCreate(false);
              setName("");
              setRole("");
              setEmail("");
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border border-edge-strong bg-card p-6 shadow-2xl"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setShowCreate(false);
                setName("");
                setRole("");
                setEmail("");
              }
              if (e.key === "Enter" && e.target instanceof HTMLElement && e.target.tagName !== "TEXTAREA") {
                e.preventDefault();
                handleCreate();
              }
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">
                Add Prototyper
              </h2>
              <button
                onClick={() => {
                  setShowCreate(false);
                  setName("");
                  setRole("");
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
                  Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., Lead Prototyper"
                  className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-secondary">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="prototyper@example.com"
                  className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
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
                  className="rounded-lg border border-edge-strong px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-foreground"
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
          className="w-full rounded-lg border border-edge-strong bg-input px-4 py-2.5 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
        />
      </div>

      {/* Prototypers grid */}
      {filtered.length === 0 ? (
        <EmptyState
          message={q
            ? `No prototypers matching "${search.trim()}".`
            : "No prototypers yet. Add one to get started."}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => {
            const protos = protoMap[p.id] || [];
            const matchingProtos = getMatchingProtos(p.id);
            return (
              <Link
                key={p.id}
                href={`/prototypers/${p.id}`}
                className="group relative rounded-xl border border-edge bg-card p-6 transition-colors hover:border-orange-600"
              >
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setConfirmState({
                      message: `Delete "${p.name}" and all ${protos.length} prototype${protos.length !== 1 ? "s" : ""}? This cannot be undone.`,
                      action: () => handleDelete(p.id),
                    });
                  }}
                  className="absolute top-3 right-3 rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  Delete
                </button>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-orange-400">
                    {p.name}
                  </h3>
                  {p.role && (
                    <StatusBadge status={p.role} styleMap={ROLE_STYLES} />
                  )}
                </div>
                {p.email && (
                  <p className="mt-0.5 text-xs text-muted">{p.email}</p>
                )}
                <p className="mt-1 text-sm text-secondary">
                  {protos.length} prototype
                  {protos.length !== 1 ? "s" : ""}
                </p>
                {/* Show matching prototypes when searching */}
                {matchingProtos.length > 0 && (
                  <div className="mt-3 space-y-1.5 border-t border-edge pt-3">
                    <p className="text-[10px] font-medium uppercase text-faint">
                      Matching prototypes
                    </p>
                    {matchingProtos.map((proto) => (
                      <div
                        key={proto.id}
                        className="rounded-lg bg-input px-2.5 py-1.5"
                      >
                        <p className="text-xs text-secondary">
                          {proto.title}
                        </p>
                        <p className="text-[10px] text-muted">
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
            );
          })}
        </div>
      )}

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!confirmState}
        onClose={() => setConfirmState(null)}
        onConfirm={() => confirmState?.action()}
        message={confirmState?.message ?? ""}
      />
    </div>
  );
}
