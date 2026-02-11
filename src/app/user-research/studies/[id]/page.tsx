"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
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

interface Participant {
  id: string;
  name: string;
  email?: string;
  persona?: string;
  userType?: string;
  studyId: string;
  status: string;
  tokenUrl?: string;
  createdAt?: { seconds: number };
}

interface StudyOutcome {
  id: string;
  decision: string;
  rationale: string;
  decidedBy: string;
  nextSteps: string;
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

const PARTICIPANT_STATUS_STYLES: Record<string, string> = {
  invited: "bg-amber-500/20 text-amber-400",
  active: "bg-green-500/20 text-green-400",
  completed: "bg-blue-500/20 text-blue-400",
  timed_out: "bg-red-500/20 text-red-400",
};

const STATUS_TRANSITIONS: Record<string, string> = {
  draft: "active",
  active: "completed",
  completed: "draft",
};

const STATUS_ACTIONS: Record<string, string> = {
  draft: "Activate",
  active: "Complete",
  completed: "Reset to Draft",
};

export default function StudyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [study, setStudy] = useState<Study | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [allParticipants, setAllParticipants] = useState<Participant[]>([]);
  const [eventCount, setEventCount] = useState(0);
  const [outcomes, setOutcomes] = useState<StudyOutcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showOutcomeForm, setShowOutcomeForm] = useState(false);
  const [outcomeDecision, setOutcomeDecision] = useState("");
  const [outcomeRationale, setOutcomeRationale] = useState("");
  const [outcomeDecidedBy, setOutcomeDecidedBy] = useState("");
  const [outcomeNextSteps, setOutcomeNextSteps] = useState("");
  const [savingOutcome, setSavingOutcome] = useState(false);

  // Add participant state
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [addMode, setAddMode] = useState<"existing" | "new">("existing");
  const [selectedParticipantId, setSelectedParticipantId] = useState("");
  const [newParticipantName, setNewParticipantName] = useState("");
  const [newParticipantEmail, setNewParticipantEmail] = useState("");
  const [savingParticipant, setSavingParticipant] = useState(false);

  // Edit study state
  const [showEditStudy, setShowEditStudy] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<"draft" | "active" | "completed">("draft");
  const [editProtoKey, setEditProtoKey] = useState("");
  const [savingStudy, setSavingStudy] = useState(false);

  // Prototypes for study edit
  const [prototypers, setPrototypers] = useState<Prototyper[]>([]);
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);

  // Listen to study
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "studies", id), (snap) => {
      if (snap.exists()) {
        setStudy({ id: snap.id, ...(snap.data() as Omit<Study, "id">) });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  // Listen to participants for this study
  useEffect(() => {
    const q = query(collection(db, "participants"), where("studyId", "==", id));
    const unsub = onSnapshot(q, (snap) => {
      setParticipants(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Participant, "id">),
        }))
      );
    });
    return () => unsub();
  }, [id]);

  // Listen to all participants (for the "add existing" dropdown)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "participants"), (snap) => {
      setAllParticipants(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Participant, "id">),
        }))
      );
    });
    return () => unsub();
  }, []);

  // Listen to event count for this study
  useEffect(() => {
    const q = query(collection(db, "events"), where("studyId", "==", id));
    const unsub = onSnapshot(q, (snap) => {
      setEventCount(snap.size);
    });
    return () => unsub();
  }, [id]);

  // Listen to study outcomes
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "studies", id, "outcomes"), (snap) => {
      const docs = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<StudyOutcome, "id">),
      }));
      docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setOutcomes(docs);
    });
    return () => unsub();
  }, [id]);

  // Listen to prototypers + prototypes for edit dialog
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

  const handleAddOutcome = async () => {
    if (!outcomeDecision.trim()) return;
    setSavingOutcome(true);
    try {
      await addDoc(collection(db, "studies", id, "outcomes"), {
        decision: outcomeDecision.trim(),
        rationale: outcomeRationale.trim(),
        decidedBy: outcomeDecidedBy.trim(),
        nextSteps: outcomeNextSteps.trim(),
        createdAt: Timestamp.now(),
      });
      setOutcomeDecision("");
      setOutcomeRationale("");
      setOutcomeDecidedBy("");
      setOutcomeNextSteps("");
      setShowOutcomeForm(false);
    } catch (err) {
      console.error("Failed to add outcome:", err);
    } finally {
      setSavingOutcome(false);
    }
  };

  const handleStatusChange = async () => {
    if (!study) return;
    setUpdating(true);
    try {
      const nextStatus = STATUS_TRANSITIONS[study.status] as Study["status"];
      await updateDoc(doc(db, "studies", id), { status: nextStatus });
      setStudy({ ...study, status: nextStatus });
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdating(false);
    }
  };

  // Open edit study dialog
  const openEditStudy = () => {
    if (!study) return;
    setEditName(study.name);
    setEditDescription(study.description);
    setEditStatus(study.status);
    setEditProtoKey(
      study.prototypeId && study.prototyperId
        ? `${study.prototyperId}:${study.prototypeId}`
        : ""
    );
    setShowEditStudy(true);
  };

  const handleSaveStudy = async () => {
    if (!editName.trim()) return;
    setSavingStudy(true);
    try {
      const selectedProto = editProtoKey
        ? prototypes.find((p) => `${p.prototyperId}:${p.id}` === editProtoKey)
        : null;

      await updateDoc(doc(db, "studies", id), {
        name: editName.trim(),
        description: editDescription.trim(),
        status: editStatus,
        prototypeId: selectedProto?.id ?? null,
        prototyperId: selectedProto?.prototyperId ?? null,
        prototypeTitle: selectedProto?.title ?? null,
        prototypeVariant: selectedProto?.variant ?? null,
      });
      setShowEditStudy(false);
    } catch (err) {
      console.error("Failed to update study:", err);
    } finally {
      setSavingStudy(false);
    }
  };

  // Add existing participant to this study
  const handleAddExistingParticipant = async () => {
    if (!selectedParticipantId) return;
    setSavingParticipant(true);
    try {
      await updateDoc(doc(db, "participants", selectedParticipantId), {
        studyId: id,
      });
      setSelectedParticipantId("");
      setShowAddParticipant(false);
    } catch (err) {
      console.error("Failed to assign participant:", err);
    } finally {
      setSavingParticipant(false);
    }
  };

  // Create new participant and assign to this study
  const handleCreateParticipant = async () => {
    if (!newParticipantName.trim()) return;
    setSavingParticipant(true);
    try {
      await addDoc(collection(db, "participants"), {
        name: newParticipantName.trim(),
        email: newParticipantEmail.trim() || null,
        studyId: id,
        status: "invited",
        createdAt: serverTimestamp(),
      });
      setNewParticipantName("");
      setNewParticipantEmail("");
      setShowAddParticipant(false);
    } catch (err) {
      console.error("Failed to create participant:", err);
    } finally {
      setSavingParticipant(false);
    }
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState<string | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  const handleCopyLink = async (p: Participant) => {
    if (p.tokenUrl) {
      try {
        await navigator.clipboard.writeText(p.tokenUrl);
        setCopiedId(p.id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch {
        prompt("Copy this link:", p.tokenUrl);
      }
      return;
    }
    // Generate a token if missing
    setGeneratingLink(p.id);
    try {
      const tokenRes = await fetch("/api/auth/participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: p.id,
          studyId: id,
          name: p.name,
          prototypeVariant: study?.prototypeVariant,
        }),
      });
      if (!tokenRes.ok) {
        console.error("Token generation failed:", tokenRes.status);
        return;
      }
      const tokenData = await tokenRes.json();
      await updateDoc(doc(db, "participants", p.id), { tokenUrl: tokenData.url });
      try {
        await navigator.clipboard.writeText(tokenData.url);
        setCopiedId(p.id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch {
        prompt("Copy this link:", tokenData.url);
      }
    } catch (err) {
      console.error("Failed to generate link:", err);
    } finally {
      setGeneratingLink(null);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      await updateDoc(doc(db, "participants", participantId), {
        studyId: "",
      });
    } catch (err) {
      console.error("Failed to remove participant:", err);
    }
  };

  // Participants not already assigned to this study
  const unassignedParticipants = allParticipants.filter(
    (p) => p.studyId !== id
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-muted">Loading study...</p>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="p-8">
        <p className="text-muted">Study not found.</p>
        <Link
          href="/user-research/studies"
          className="mt-2 inline-block text-sm text-orange-400 hover:underline"
        >
          Back to Studies
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8">
      <header className="mb-6">
        <Link
          href="/user-research/studies"
          className="mb-3 inline-block text-sm text-muted hover:text-foreground transition-colors"
        >
          &larr; Back to Studies
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{study.name}</h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[study.status]}`}
              >
                {study.status}
              </span>
            </div>
            {study.description && (
              <p className="mt-1 text-sm text-secondary">{study.description}</p>
            )}
            {study.createdAt && (
              <p className="mt-1 text-xs text-faint">
                Created{" "}
                {new Date(study.createdAt.seconds * 1000).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {study.prototypeVariant && (
              <Link
                href={`/prototype?variant=${study.prototypeVariant}`}
                target="_blank"
                className="rounded-lg border border-edge-strong px-4 py-2 text-sm font-medium text-secondary transition-colors hover:border-orange-500 hover:text-orange-400"
              >
                Preview Prototype
              </Link>
            )}
            <button
              onClick={openEditStudy}
              className="rounded-lg border border-edge-strong px-4 py-2 text-sm font-medium text-secondary transition-colors hover:border-orange-500 hover:text-orange-400"
            >
              Edit
            </button>
            <button
              onClick={handleStatusChange}
              disabled={updating}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
            >
              {updating ? "Updating..." : STATUS_ACTIONS[study.status]}
            </button>
          </div>
        </div>
      </header>

      {/* Edit Study dialog */}
      {showEditStudy && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEditStudy(false);
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border border-edge-strong bg-card p-6 shadow-2xl"
            onKeyDown={(e) => {
              if (e.key === "Escape") setShowEditStudy(false);
              if (e.key === "Enter" && e.target instanceof HTMLElement && e.target.tagName !== "TEXTAREA") {
                e.preventDefault();
                handleSaveStudy();
              }
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Edit Study</h2>
              <button
                onClick={() => setShowEditStudy(false)}
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
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g., Feed Sorting Experiment"
                  className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-secondary">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
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
                    value={editProtoKey}
                    onChange={(e) => setEditProtoKey(e.target.value)}
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
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-secondary">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as "draft" | "active" | "completed")
                    }
                    className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  onClick={() => setShowEditStudy(false)}
                  className="rounded-lg border border-edge-strong px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveStudy}
                  disabled={!editName.trim() || savingStudy}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingStudy ? "Saving..." : "Update Study"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-edge bg-card p-4">
          <p className="text-xs font-medium uppercase text-muted">Prototype</p>
          <p className="mt-1 text-lg font-bold text-foreground">
            {study.prototypeTitle || "None selected"}
          </p>
        </div>
        <div className="rounded-xl border border-edge bg-card p-4">
          <p className="text-xs font-medium uppercase text-muted">
            Participants
          </p>
          <p className="mt-1 text-lg font-bold text-foreground">
            {participants.length}
          </p>
        </div>
        <div className="rounded-xl border border-edge bg-card p-4">
          <p className="text-xs font-medium uppercase text-muted">
            Events Tracked
          </p>
          <p className="mt-1 text-lg font-bold text-foreground">{eventCount}</p>
        </div>
      </div>

      {/* Participants */}
      <div className="rounded-xl border border-edge bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Participants</h2>
          <button
            onClick={() => {
              setAddMode("existing");
              setSelectedParticipantId("");
              setNewParticipantName("");
              setNewParticipantEmail("");
              setShowAddParticipant(true);
            }}
            className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-500"
          >
            Add Participant
          </button>
        </div>

        {/* Add Participant dialog */}
        {showAddParticipant && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-overlay"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAddParticipant(false);
            }}
          >
            <div
              className="w-full max-w-md rounded-xl border border-edge-strong bg-card p-6 shadow-2xl"
              onKeyDown={(e) => {
                if (e.key === "Escape") setShowAddParticipant(false);
                if (e.key === "Enter" && e.target instanceof HTMLElement && e.target.tagName !== "TEXTAREA") {
                  e.preventDefault();
                  if (addMode === "existing") handleAddExistingParticipant();
                  else handleCreateParticipant();
                }
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  Add Participant
                </h2>
                <button
                  onClick={() => setShowAddParticipant(false)}
                  className="rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:text-foreground"
                >
                  &times;
                </button>
              </div>

              {/* Mode tabs */}
              <div className="mb-4 flex rounded-lg border border-edge-strong bg-input p-0.5">
                <button
                  onClick={() => setAddMode("existing")}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    addMode === "existing"
                      ? "bg-subtle text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Existing Participant
                </button>
                <button
                  onClick={() => setAddMode("new")}
                  className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    addMode === "new"
                      ? "bg-subtle text-foreground"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  Create New
                </button>
              </div>

              {addMode === "existing" ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-secondary">
                      Select Participant
                    </label>
                    <select
                      value={selectedParticipantId}
                      onChange={(e) => setSelectedParticipantId(e.target.value)}
                      className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none"
                    >
                      <option value="">Choose a participant...</option>
                      {unassignedParticipants.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                          {p.email ? ` (${p.email})` : ""}
                        </option>
                      ))}
                    </select>
                    {unassignedParticipants.length === 0 && (
                      <p className="mt-1 text-xs text-faint">
                        All participants are already assigned. Create a new one
                        instead.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      onClick={() => setShowAddParticipant(false)}
                      className="rounded-lg border border-edge-strong px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddExistingParticipant}
                      disabled={!selectedParticipantId || savingParticipant}
                      className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingParticipant ? "Adding..." : "Add to Study"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-secondary">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newParticipantName}
                      onChange={(e) => setNewParticipantName(e.target.value)}
                      placeholder="e.g., Jane Doe"
                      className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-secondary">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      value={newParticipantEmail}
                      onChange={(e) => setNewParticipantEmail(e.target.value)}
                      placeholder="participant@example.com"
                      className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      onClick={() => setShowAddParticipant(false)}
                      className="rounded-lg border border-edge-strong px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-foreground"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateParticipant}
                      disabled={!newParticipantName.trim() || savingParticipant}
                      className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingParticipant ? "Creating..." : "Create & Add"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {participants.length === 0 ? (
          <p className="text-sm text-muted">
            No participants assigned to this study yet.
          </p>
        ) : (
          <div className="space-y-2">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-edge-strong bg-input px-4 py-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    {p.persona && (
                      <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-400">
                        {p.persona}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        PARTICIPANT_STATUS_STYLES[p.status] ||
                        PARTICIPANT_STATUS_STYLES.invited
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
                    {p.userType && <span>{p.userType}</span>}
                    {p.userType && p.email && <span>&middot;</span>}
                    {p.email && <span>{p.email}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyLink(p)}
                    disabled={generatingLink === p.id}
                    className="rounded-lg border border-edge-strong px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-orange-500 hover:text-orange-400 disabled:opacity-50"
                  >
                    {generatingLink === p.id
                      ? "Generating..."
                      : copiedId === p.id
                        ? "Copied!"
                        : "Copy Link"}
                  </button>
                  <button
                    onClick={() => {
                      setConfirmAction(() => () => handleRemoveParticipant(p.id));
                      setConfirmMessage(`Remove "${p.name}" from this study?`);
                    }}
                    className="rounded-lg px-3 py-1.5 text-xs text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Study Outcomes */}
      <div className="mt-8 rounded-xl border border-edge bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Study Outcomes</h2>
          <button
            onClick={() => setShowOutcomeForm(!showOutcomeForm)}
            className="rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-orange-500"
          >
            {showOutcomeForm ? "Cancel" : "Add Decision"}
          </button>
        </div>

        {showOutcomeForm && (
          <div className="mb-4 rounded-lg border border-edge-strong bg-input p-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-secondary">Decision</label>
              <input
                type="text"
                value={outcomeDecision}
                onChange={(e) => setOutcomeDecision(e.target.value)}
                placeholder="e.g., Proceed with variant-a for production"
                className="w-full rounded-lg border border-edge-strong bg-subtle px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-secondary">Rationale</label>
              <textarea
                value={outcomeRationale}
                onChange={(e) => setOutcomeRationale(e.target.value)}
                placeholder="Why was this decision made?"
                rows={3}
                className="w-full rounded-lg border border-edge-strong bg-subtle px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-orange-500 focus:outline-none resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-secondary">Decided By</label>
                <input
                  type="text"
                  value={outcomeDecidedBy}
                  onChange={(e) => setOutcomeDecidedBy(e.target.value)}
                  placeholder="e.g., VP Product, Leadership Team"
                  className="w-full rounded-lg border border-edge-strong bg-subtle px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-orange-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-secondary">Next Steps</label>
                <input
                  type="text"
                  value={outcomeNextSteps}
                  onChange={(e) => setOutcomeNextSteps(e.target.value)}
                  placeholder="e.g., Ship to 10% of users in Q2"
                  className="w-full rounded-lg border border-edge-strong bg-subtle px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleAddOutcome}
              disabled={!outcomeDecision.trim() || savingOutcome}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingOutcome ? "Saving..." : "Save Decision"}
            </button>
          </div>
        )}

        {outcomes.length === 0 && !showOutcomeForm ? (
          <p className="text-sm text-muted">
            No outcomes recorded yet. Add a decision when leadership responds to the results.
          </p>
        ) : (
          <div className="space-y-3">
            {outcomes.map((o) => (
              <div key={o.id} className="rounded-lg border border-edge-strong bg-input p-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{o.decision}</h3>
                  {o.createdAt && (
                    <span className="text-[10px] text-faint flex-shrink-0 ml-3">
                      {new Date(o.createdAt.seconds * 1000).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {o.rationale && (
                  <p className="mt-2 text-xs text-secondary">{o.rationale}</p>
                )}
                <div className="mt-3 flex items-center gap-4 text-xs">
                  {o.decidedBy && (
                    <span className="text-muted">
                      By: <span className="text-secondary">{o.decidedBy}</span>
                    </span>
                  )}
                  {o.nextSteps && (
                    <span className="text-muted">
                      Next: <span className="text-secondary">{o.nextSteps}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
            <h2 className="text-sm font-semibold text-foreground">Confirm</h2>
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
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
