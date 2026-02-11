"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { VARIANT_PRESETS } from "@/lib/variants";

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
  modifiedAt?: { seconds: number };
  createdAt?: { seconds: number };
}

const VARIANT_BADGE_COLORS: Record<string, string> = {
  default: "bg-subtle text-secondary",
  "variant-a": "bg-blue-500/20 text-blue-400",
  "variant-b": "bg-green-500/20 text-green-400",
  "variant-c": "bg-purple-500/20 text-purple-400",
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-subtle text-secondary",
  "in-progress": "bg-amber-500/20 text-amber-400",
  complete: "bg-green-500/20 text-green-400",
};

const ROLE_STYLES: Record<string, string> = {
  "Lead Prototyper": "bg-orange-500/20 text-orange-400",
  "UX Engineer": "bg-violet-500/20 text-violet-400",
  "Interaction Designer": "bg-sky-500/20 text-sky-400",
};

export default function PrototypesPage() {
  const router = useRouter();
  const [prototypers, setPrototypers] = useState<Prototyper[]>([]);
  const [allPrototypes, setAllPrototypes] = useState<Prototype[]>([]);
  const [search, setSearch] = useState("");
  const [creatingStudy, setCreatingStudy] = useState<string | null>(null);

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
          // Flatten all prototypes
          setAllPrototypes(Array.from(protosMap.values()).flat());
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
      const ref = await addDoc(collection(db, "studies"), {
        name: `${proto.title} Study`,
        description: "",
        status: "draft",
        prototypeId: proto.id,
        prototyperId: proto.prototyperId,
        prototypeTitle: proto.title,
        prototypeVariant: proto.variant,
        createdAt: serverTimestamp(),
      });
      router.push(`/user-research/studies/${ref.id}`);
    } catch (err) {
      console.error("Failed to create study:", err);
    } finally {
      setCreatingStudy(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            &larr;
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Prototypes</h1>
        </div>
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
          <div className="rounded-xl border border-dashed border-edge p-8 text-center">
            <p className="text-sm text-muted">
              {query
                ? "No prototypes match your search."
                : "No prototypes yet. Add prototypes from the Prototypers page."}
            </p>
          </div>
        ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((proto) => (
                <div
                  key={`${proto.prototyperId}-${proto.id}`}
                  className="rounded-xl border border-edge bg-card p-6 transition-colors hover:border-edge-strong"
                >
                  <h3 className="text-lg font-semibold text-foreground">
                    {proto.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[proto.status] || STATUS_STYLES.draft}`}
                    >
                      {proto.status}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${VARIANT_BADGE_COLORS[proto.variant] || VARIANT_BADGE_COLORS.default}`}
                    >
                      {VARIANT_PRESETS[proto.variant]?.label ?? proto.variant}
                    </span>
                  </div>
                  {proto.description && (
                    <p className="mt-2 text-sm text-secondary">
                      {proto.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                    <Link
                      href={`/prototypers/${proto.prototyperId}`}
                      className="hover:text-orange-400 transition-colors"
                    >
                      {proto.prototyperName}
                    </Link>
                    {proto.prototyperRole && (
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${ROLE_STYLES[proto.prototyperRole] || "bg-subtle text-secondary"}`}
                      >
                        {proto.prototyperRole}
                      </span>
                    )}
                    {proto.modifiedAt && (
                      <span className="text-[10px]">
                        Modified{" "}
                        {new Date(
                          proto.modifiedAt.seconds * 1000
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {proto.url ? (
                      <a
                        href={proto.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-edge-strong px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-orange-500 hover:text-orange-400"
                      >
                        Preview
                      </a>
                    ) : proto.fileName ? (
                      <Link
                        href={`/prototype/uploaded/${proto.prototyperId}/${proto.id}`}
                        target="_blank"
                        className="rounded-lg border border-edge-strong px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-orange-500 hover:text-orange-400"
                      >
                        Preview
                      </Link>
                    ) : (
                      <Link
                        href={`/prototype?variant=${proto.variant}`}
                        target="_blank"
                        className="rounded-lg border border-edge-strong px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-orange-500 hover:text-orange-400"
                      >
                        Preview
                      </Link>
                    )}
                    <button
                      onClick={() => handleCreateStudy(proto)}
                      disabled={creatingStudy === proto.id}
                      className="rounded-lg border border-edge-strong px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-orange-500 hover:text-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creatingStudy === proto.id ? "Creating..." : "Create Study"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </section>

    </div>
  );
}
