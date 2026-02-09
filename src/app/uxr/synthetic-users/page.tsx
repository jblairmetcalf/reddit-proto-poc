"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

interface SyntheticUser {
  id: string;
  name: string;
  persona: string;
  description: string;
  traits: string[];
  browsingHabits: string;
  createdAt?: { seconds: number };
}

const PERSONA_PRESETS: {
  persona: string;
  label: string;
  description: string;
  traits: string[];
  browsingHabits: string;
  style: string;
}[] = [
  {
    persona: "new",
    label: "New User",
    description: "Just signed up, exploring the platform for the first time",
    traits: ["curious", "unfamiliar with UI patterns", "low engagement"],
    browsingHabits: "Browses popular feed, rarely votes or comments, reads titles only",
    style: "bg-emerald-500/20 text-emerald-400",
  },
  {
    persona: "casual",
    label: "Casual Browser",
    description: "Visits occasionally to browse popular content and trending topics",
    traits: ["passive consumer", "moderate familiarity", "short sessions"],
    browsingHabits: "Scrolls popular/home feed, upvotes occasionally, rarely opens comments",
    style: "bg-sky-500/20 text-sky-400",
  },
  {
    persona: "core",
    label: "Core User",
    description: "Daily active user with subscribed communities and personalized feed",
    traits: ["highly engaged", "community-oriented", "votes regularly"],
    browsingHabits: "Checks home feed daily, browses multiple subreddits, votes on most posts",
    style: "bg-orange-500/20 text-orange-400",
  },
  {
    persona: "commenter",
    label: "Commenter",
    description: "Primarily engages through discussions and comment threads",
    traits: ["opinionated", "discussion-driven", "sorts by new/controversial"],
    browsingHabits: "Opens most comment threads, replies frequently, sorts comments by new",
    style: "bg-violet-500/20 text-violet-400",
  },
  {
    persona: "poster",
    label: "Poster",
    description: "Creates original content and shares links across communities",
    traits: ["content creator", "karma-aware", "cross-posts"],
    browsingHabits: "Posts daily, monitors post performance, engages with commenters",
    style: "bg-pink-500/20 text-pink-400",
  },
  {
    persona: "lurker",
    label: "Lurker",
    description: "Long-time user who reads extensively but never engages",
    traits: ["silent observer", "deep reader", "never votes or comments"],
    browsingHabits: "Long sessions, reads full comment threads, never interacts",
    style: "bg-zinc-500/20 text-zinc-400",
  },
  {
    persona: "moderator",
    label: "Moderator",
    description: "Community moderator focused on content quality and rule enforcement",
    traits: ["authority-focused", "queue-driven", "policy-aware"],
    browsingHabits: "Reviews mod queue, checks reported content, monitors community health",
    style: "bg-amber-500/20 text-amber-400",
  },
  {
    persona: "power_user",
    label: "Power User",
    description: "Highly active across many communities with deep platform knowledge",
    traits: ["multi-community", "feature-savvy", "high karma"],
    browsingHabits: "Uses keyboard shortcuts, customizes feed, manages many subscriptions",
    style: "bg-red-500/20 text-red-400",
  },
];

const PERSONA_STYLES: Record<string, string> = Object.fromEntries(
  PERSONA_PRESETS.map((p) => [p.persona, p.style])
);

function getPersonaLabel(persona: string) {
  return PERSONA_PRESETS.find((p) => p.persona === persona)?.label ?? persona;
}

export default function SyntheticUsersPage() {
  const [users, setUsers] = useState<SyntheticUser[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [persona, setPersona] = useState("new");
  const [description, setDescription] = useState("");
  const [traits, setTraits] = useState("");
  const [browsingHabits, setBrowsingHabits] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "syntheticUsers"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setUsers(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<SyntheticUser, "id">),
        }))
      );
    });
    return () => unsub();
  }, []);

  function applyPreset(personaKey: string) {
    setPersona(personaKey);
    const preset = PERSONA_PRESETS.find((p) => p.persona === personaKey);
    if (preset && !editingId) {
      setDescription(preset.description);
      setTraits(preset.traits.join(", "));
      setBrowsingHabits(preset.browsingHabits);
    }
  }

  function resetForm() {
    setName("");
    setPersona("new");
    setDescription("");
    setTraits("");
    setBrowsingHabits("");
    setEditingId(null);
  }

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const data = {
        name: name.trim(),
        persona,
        description: description.trim(),
        traits: traits
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        browsingHabits: browsingHabits.trim(),
      };

      if (editingId) {
        await updateDoc(doc(db, "syntheticUsers", editingId), data);
      } else {
        await addDoc(collection(db, "syntheticUsers"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      resetForm();
      setShowCreate(false);
    } catch (err) {
      console.error("Failed to save synthetic user:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (user: SyntheticUser) => {
    setName(user.name);
    setPersona(user.persona);
    setDescription(user.description);
    setTraits(user.traits.join(", "));
    setBrowsingHabits(user.browsingHabits);
    setEditingId(user.id);
    setShowCreate(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "syntheticUsers", id));
    } catch (err) {
      console.error("Failed to delete synthetic user:", err);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const seedUsers = PERSONA_PRESETS.map((preset, i) => ({
        name: `${preset.label} ${i + 1}`,
        persona: preset.persona,
        description: preset.description,
        traits: preset.traits,
        browsingHabits: preset.browsingHabits,
      }));
      for (const user of seedUsers) {
        await addDoc(collection(db, "syntheticUsers"), {
          ...user,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("Failed to seed synthetic users:", err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Synthetic Users</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Create and manage synthetic user personas for prototype testing
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:border-orange-500 hover:text-orange-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {seeding ? "Seeding..." : "Seed All Personas"}
          </button>
          <button
            onClick={() => {
              if (showCreate) {
                resetForm();
                setShowCreate(false);
              } else {
                setShowCreate(true);
              }
            }}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
          >
            {showCreate ? "Cancel" : "Add Synthetic User"}
          </button>
        </div>
      </header>

      {/* Create / Edit form */}
      {showCreate && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-4 text-sm font-semibold text-white">
            {editingId ? "Edit Synthetic User" : "Create Synthetic User"}
          </h2>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Alex the Lurker"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-400">
                  Persona
                </label>
                <select
                  value={persona}
                  onChange={(e) => applyPreset(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
                >
                  {PERSONA_PRESETS.map((p) => (
                    <option key={p.persona} value={p.persona}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this synthetic user's background and motivations..."
                rows={2}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">
                Traits (comma-separated)
              </label>
              <input
                type="text"
                value={traits}
                onChange={(e) => setTraits(e.target.value)}
                placeholder="e.g., curious, low engagement, short sessions"
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-400">
                Browsing Habits
              </label>
              <textarea
                value={browsingHabits}
                onChange={(e) => setBrowsingHabits(e.target.value)}
                placeholder="Describe how this user typically browses Reddit..."
                rows={2}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-orange-500 focus:outline-none resize-none"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={!name.trim() || creating}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating
                ? "Saving..."
                : editingId
                  ? "Update Synthetic User"
                  : "Create Synthetic User"}
            </button>
          </div>
        </div>
      )}

      {/* Users list */}
      {users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-12 text-center">
          <p className="text-sm text-zinc-500">
            No synthetic users yet. Create one or seed all personas to get
            started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition-colors hover:border-zinc-700"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-white">
                      {user.name}
                    </h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${PERSONA_STYLES[user.persona] || "bg-zinc-700 text-zinc-300"}`}
                    >
                      {getPersonaLabel(user.persona)}
                    </span>
                  </div>
                  {user.description && (
                    <p className="mt-1.5 text-xs text-zinc-400">
                      {user.description}
                    </p>
                  )}
                  {user.traits.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {user.traits.map((trait) => (
                        <span
                          key={trait}
                          className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-500"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  )}
                  {user.browsingHabits && (
                    <p className="mt-2 text-[10px] text-zinc-600">
                      {user.browsingHabits}
                    </p>
                  )}
                  {user.createdAt && (
                    <p className="mt-1 text-[10px] text-zinc-700">
                      Created{" "}
                      {new Date(
                        user.createdAt.seconds * 1000
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:border-orange-500 hover:text-orange-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="rounded-lg px-3 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
