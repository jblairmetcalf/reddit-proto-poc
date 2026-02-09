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
  query,
  orderBy,
} from "firebase/firestore";

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

const SEED_DATA = [
  {
    name: "Blair Metcalf",
    role: "Lead Prototyper",
    email: "blair@example.com",
    prototypes: [
      {
        title: "Compact Feed Exploration",
        description: "Variant A feed density test",
        status: "complete",
        variant: "variant-a",
      },
      {
        title: "Vote Bias Removal",
        description: "Hidden vote count interaction study",
        status: "in-progress",
        variant: "variant-c",
      },
      {
        title: "Mobile Navigation Redesign",
        description: "Bottom nav pattern exploration",
        status: "draft",
        variant: "default",
      },
    ],
  },
  {
    name: "James Lee",
    role: "UX Engineer",
    email: "james@example.com",
    prototypes: [
      {
        title: "Comment Thread Redesign",
        description: "Nested comment UX improvements",
        status: "complete",
        variant: "default",
      },
      {
        title: "Award System Simplification",
        description: "Minimal chrome experiment",
        status: "in-progress",
        variant: "variant-b",
      },
      {
        title: "Search Flow Optimization",
        description: "Subreddit discovery patterns",
        status: "draft",
        variant: "variant-a",
      },
    ],
  },
  {
    name: "Josh Chisholm",
    role: "Interaction Designer",
    email: "josh@example.com",
    prototypes: [
      {
        title: "Flair-Based Filtering",
        description: "Topic-based content curation",
        status: "complete",
        variant: "default",
      },
      {
        title: "Creator Tools Dashboard",
        description: "Post creation workflow",
        status: "in-progress",
        variant: "variant-a",
      },
      {
        title: "Notification Triage",
        description: "Priority-based notification sorting",
        status: "draft",
        variant: "variant-b",
      },
    ],
  },
];

export default function PrototypersPage() {
  const [prototypers, setPrototypers] = useState<Prototyper[]>([]);
  const [protoCounts, setProtoCounts] = useState<Record<string, number>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [email, setEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "prototypers"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setPrototypers(
        snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Prototyper, "id">) }))
      );
    });
    return () => unsub();
  }, []);

  // Listen for prototype counts per prototyper
  useEffect(() => {
    const unsubs: (() => void)[] = [];

    for (const p of prototypers) {
      const unsub = onSnapshot(
        collection(db, "prototypers", p.id, "prototypes"),
        (snap) => {
          setProtoCounts((prev) => ({ ...prev, [p.id]: snap.size }));
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
      // Delete sub-collection prototypes first
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

  const handleSeed = async () => {
    setSeeding(true);
    try {
      for (const person of SEED_DATA) {
        const prototyperRef = await addDoc(collection(db, "prototypers"), {
          name: person.name,
          role: person.role,
          email: person.email,
          createdAt: serverTimestamp(),
        });
        for (const proto of person.prototypes) {
          await addDoc(
            collection(db, "prototypers", prototyperRef.id, "prototypes"),
            {
              title: proto.title,
              description: proto.description,
              status: proto.status,
              variant: proto.variant,
              url: "",
              fileName: "",
              modifiedAt: serverTimestamp(),
              createdAt: serverTimestamp(),
            }
          );
        }
      }
    } catch (err) {
      console.error("Failed to seed data:", err);
    } finally {
      setSeeding(false);
    }
  };

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
          <div className="flex items-center gap-3">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:border-orange-500 hover:text-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {seeding ? "Seeding..." : "Seed Team"}
            </button>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
            >
              {showCreate ? "Cancel" : "Add Prototyper"}
            </button>
          </div>
        </div>
      </header>

      {/* Create form */}
      {showCreate && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">
            Add Prototyper
          </h2>
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
            <button
              onClick={handleCreate}
              disabled={!name.trim() || creating}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Adding..." : "Add Prototyper"}
            </button>
          </div>
        </div>
      )}

      {/* Prototypers grid */}
      {prototypers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
          <p className="text-sm text-zinc-500">
            No prototypers yet. Add one or seed the team to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {prototypers.map((p) => (
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
                  {protoCounts[p.id] ?? 0} prototype
                  {(protoCounts[p.id] ?? 0) !== 1 ? "s" : ""}
                </p>
                {p.email && (
                  <p className="mt-1 text-[10px] text-zinc-600">{p.email}</p>
                )}
              </Link>
              <button
                onClick={() => handleDelete(p.id)}
                className="mt-3 rounded-lg px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
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
