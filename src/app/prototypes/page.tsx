"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Toast from "@/components/infrastructure/Toast";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { VARIANT_PRESETS } from "@/lib/variants";
import { ConfirmDialog, StatusBadge, EmptyState, PROTOTYPE_STATUS_STYLES, VARIANT_BADGE_COLORS, ROLE_STYLES } from "@/components/infrastructure";

interface Prototyper {
  id: string;
  name: string;
  role: string;
  email: string;
}

interface Prototype {
  id: string;
  prototyperId: string;
  prototyperName: string;
  prototyperRole: string;
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

export default function PrototypesPage() {
  const router = useRouter();
  const [prototypers, setPrototypers] = useState<Prototyper[]>([]);
  const [allPrototypes, setAllPrototypes] = useState<Prototype[]>([]);
  const [search, setSearch] = useState("");
  const [creatingStudy, setCreatingStudy] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string } | null>(null);
  const [confirmState, setConfirmState] = useState<{ message: string; action: () => void } | null>(null);
  const [showEditId, setShowEditId] = useState<string | null>(null);

  // Listen to prototypers
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "prototypers"),
      (snap) => {
        setPrototypers(
          snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Prototyper, "id">),
          }))
        );
      },
      (err) => console.error("Prototypers snapshot error:", err)
    );
    return () => unsub();
  }, []);

  // Listen to each prototyper's prototypes sub-collection
  useEffect(() => {
    if (prototypers.length === 0) {
      setAllPrototypes([]);
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
              prototyperRole: p.role,
              ...(d.data() as Omit<Prototype, "id" | "prototyperId" | "prototyperName" | "prototyperRole">),
            }))
          );
          // Flatten all prototypes and sort by most recently updated
          const all = Array.from(protosMap.values()).flat();
          all.sort((a, b) => (b.modifiedAt?.seconds ?? b.createdAt?.seconds ?? 0) - (a.modifiedAt?.seconds ?? a.createdAt?.seconds ?? 0));
          setAllPrototypes(all);
        },
        (err) => console.error(`Prototypes snapshot error for ${p.name}:`, err)
      );
      unsubs.push(unsub);
    }

    return () => unsubs.forEach((u) => u());
  }, [prototypers]);

  const query = search.toLowerCase().trim();
  const filtered = query
    ? allPrototypes.filter((p) => {
        const variantLabel = VARIANT_PRESETS[p.variant]?.label ?? p.variant;
        const searchable = [
          p.title,
          p.description,
          p.status,
          p.variant,
          variantLabel,
          p.prototyperName,
          p.prototyperRole,
          p.url,
          p.fileName,
        ]
          .join(" ")
          .toLowerCase();
        return searchable.includes(query);
      })
    : allPrototypes;

  const handleCreateStudy = async (proto: Prototype) => {
    setCreatingStudy(proto.id);
    try {
      const protoType = proto.url ? "link" : proto.fileName ? "file" : "default";
      const ref = await addDoc(collection(db, "studies"), {
        name: `${proto.title} Study`,
        description: "",
        status: "draft",
        prototypeId: proto.id,
        prototyperId: proto.prototyperId,
        prototypeTitle: proto.title,
        prototypeVariant: proto.variant,
        prototypeType: protoType,
        prototypeUrl: proto.url || null,
        createdAt: serverTimestamp(),
      });
      router.push(`/user-research/studies/${ref.id}`);
    } catch (err) {
      console.error("Failed to create study:", err);
    } finally {
      setCreatingStudy(null);
    }
  };

  function getPreviewPath(proto: Prototype): string {
    if (proto.url) return `/prototype/link/${proto.prototyperId}/${proto.id}`;
    if (proto.fileName) return `/prototype/uploaded/${proto.prototyperId}/${proto.id}`;
    return `/prototype?variant=${proto.variant}`;
  }

  const handleCopyLink = async (proto: Prototype) => {
    const url = `${window.location.origin}${getPreviewPath(proto)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(proto.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      prompt("Copy this link:", url);
    }
  };

  const handleDelete = async (proto: Prototype) => {
    try {
      if (proto.fileUrl) {
        await deleteObject(ref(storage, proto.fileUrl)).catch(() => {});
      }
      await deleteDoc(doc(db, "prototypers", proto.prototyperId, "prototypes", proto.id));
      setToast({ message: `Deleted "${proto.title}"` });
    } catch (err) {
      console.error("Failed to delete prototype:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="mb-8">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-orange-400"
        >
          &larr; Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Prototypes</h1>
        <p className="text-sm text-secondary">
          Search all prototypes and review variant configurations.
        </p>
      </header>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, author, role, status, variant, file..."
          className="w-full rounded-lg border border-edge-strong bg-card px-4 py-3 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
        />
        {query && (
          <p className="mt-2 text-xs text-muted">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for
            &ldquo;{search.trim()}&rdquo;
          </p>
        )}
      </div>

      {/* Prototypes list */}
      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
          {query ? "Search Results" : "All Prototypes"}
          <span className="ml-2 text-faint">({filtered.length})</span>
        </h2>
        {filtered.length === 0 ? (
          <EmptyState
            message={query
              ? "No prototypes match your search."
              : "No prototypes yet. Add prototypes from the Prototypers page."}
          />
        ) : (
            <div className="space-y-3">
              {filtered.map((proto) => (
                <div
                  key={`${proto.prototyperId}-${proto.id}`}
                  className="flex items-center justify-between rounded-xl border border-edge bg-card px-5 py-4 transition-colors hover:border-edge-strong"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        {proto.title}
                      </h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        proto.url
                          ? "bg-sky-500/20 text-sky-400"
                          : proto.fileName
                            ? "bg-teal-500/20 text-teal-400"
                            : "bg-violet-500/20 text-violet-400"
                      }`}>
                        {proto.url ? "Link" : proto.fileName ? "Uploaded" : "Coded"}
                      </span>
                      <StatusBadge status={proto.status} styleMap={PROTOTYPE_STATUS_STYLES} />
                      {proto.variant && proto.variant !== "default" && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${VARIANT_BADGE_COLORS[proto.variant] || VARIANT_BADGE_COLORS.default}`}
                        >
                          {VARIANT_PRESETS[proto.variant]?.label ?? proto.variant}
                        </span>
                      )}
                    </div>
                    {proto.description && (
                      <p className="mt-0.5 text-xs text-secondary truncate">
                        {proto.description}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-muted">
                      <Link
                        href={`/prototypers/${proto.prototyperId}`}
                        className="hover:text-orange-400 transition-colors"
                      >
                        {proto.prototyperName}
                      </Link>
                      {proto.modifiedAt && (
                        <> &middot; {new Date(proto.modifiedAt.seconds * 1000).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleCopyLink(proto)}
                      className="rounded-lg border border-edge-strong px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-orange-500 hover:text-orange-400"
                    >
                      {copiedId === proto.id ? "Copied!" : "Copy Link"}
                    </button>
                    <Link
                      href={getPreviewPath(proto)}
                      target="_blank"
                      className="rounded-lg border border-edge-strong px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-orange-500 hover:text-orange-400"
                    >
                      Preview
                    </Link>
                    <button
                      onClick={() => handleCreateStudy(proto)}
                      disabled={creatingStudy === proto.id}
                      className="rounded-lg border border-edge-strong px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-orange-500 hover:text-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creatingStudy === proto.id ? "Creating..." : "Create Study"}
                    </button>
                    {proto.fileUrl && (
                      <a
                        href={proto.fileUrl}
                        download={proto.fileName || true}
                        className="rounded-lg px-3 py-1.5 text-xs text-muted transition-colors hover:bg-orange-500/10 hover:text-orange-400"
                      >
                        Download
                      </a>
                    )}
                    <Link
                      href={`/prototypers/${proto.prototyperId}`}
                      className="rounded-lg px-3 py-1.5 text-xs text-muted transition-colors hover:bg-orange-500/10 hover:text-orange-400"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => setConfirmState({ message: `Delete "${proto.title}"?`, action: () => handleDelete(proto) })}
                      className="rounded-lg px-3 py-1.5 text-xs text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </section>

      <ConfirmDialog
        open={!!confirmState}
        onClose={() => setConfirmState(null)}
        onConfirm={() => confirmState?.action()}
        message={confirmState?.message ?? ""}
      />
      {toast && (
        <Toast message={toast.message} onDismiss={() => setToast(null)} />
      )}
    </div>
  );
}
