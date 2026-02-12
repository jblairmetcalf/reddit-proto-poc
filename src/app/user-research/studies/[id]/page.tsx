"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import Toast from "@/components/infrastructure/Toast";
import { Dialog, ConfirmDialog, StatusBadge, StatCard, STUDY_STATUS_STYLES, PARTICIPANT_STATUS_STYLES } from "@/components/infrastructure";
import { db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  deleteField,
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
  prototypeType?: "file" | "link" | "default" | null;
  prototypeUrl?: string;
  aiSummary?: string;
  aiSummaryAt?: { seconds: number };
  createdAt?: { seconds: number };
}

interface Participant {
  id: string;
  name: string;
  email?: string;
  persona?: string;
  userType?: string;
  studyId: string;
  studyStatus?: Record<string, string>;
  tokenUrls?: Record<string, string>;
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

interface SurveyResponse {
  id: string;
  participantId: string;
  studyId: string;
  variant: string | null;
  easeOfUse: "easy" | "neutral" | "difficult";
  foundContent: "easy" | "neutral" | "difficult";
  satisfaction: "easy" | "neutral" | "difficult";
  feedback: string | null;
  submittedAt: number;
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
  fileName: string;
  url: string;
}

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
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
  const [summarizing, setSummarizing] = useState(false);

  // Online presence
  const [onlineParticipants, setOnlineParticipants] = useState<Set<string>>(new Set());

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

  // Listen to all participants (derive study-specific list client-side)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "participants"), (snap) => {
      const all = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Participant, "id">),
      }));
      all.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setAllParticipants(all);
      setParticipants(all.filter((p) => p.studyStatus?.[id] || p.studyId === id));
    });
    return () => unsub();
  }, [id]);

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

  // Listen to survey responses
  useEffect(() => {
    const q = query(collection(db, "survey_responses"), where("studyId", "==", id));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<SurveyResponse, "id">),
      }));
      docs.sort((a, b) => b.submittedAt - a.submittedAt);
      setSurveyResponses(docs);
    });
    return () => unsub();
  }, [id]);

  // Listen to online presence for this study
  useEffect(() => {
    const STALE_MS = 90_000; // 90s fallback if delete didn't complete on close
    const q = query(collection(db, "presence"), where("studyId", "==", id));
    const unsub = onSnapshot(q, (snap) => {
      const now = Date.now();
      const ids = new Set<string>();
      snap.docs.forEach((d) => {
        const data = d.data();
        const lastSeen = data.lastSeen?.toMillis?.();
        if (data.participantId && (!lastSeen || now - lastSeen < STALE_MS)) {
          ids.add(data.participantId);
        }
      });
      setOnlineParticipants(ids);
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
              ...(d.data() as { title: string; variant: string; fileName: string; url: string }),
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

  const [origStudyEdit, setOrigStudyEdit] = useState({ name: "", description: "", status: "", protoKey: "" });
  const [toast, setToast] = useState<{ message: string; onUndo?: () => void } | null>(null);
  const studyEditHasChanges = editName !== origStudyEdit.name || editDescription !== origStudyEdit.description || editStatus !== origStudyEdit.status || editProtoKey !== origStudyEdit.protoKey;

  const confirmCloseEditStudy = () => {
    if (studyEditHasChanges && !window.confirm("You have unsaved changes. Discard them?")) return;
    setShowEditStudy(false);
  };

  // Open edit study dialog
  const openEditStudy = () => {
    if (!study) return;
    const protoKey = study.prototypeId && study.prototyperId
      ? `${study.prototyperId}:${study.prototypeId}`
      : "";
    setEditName(study.name);
    setEditDescription(study.description);
    setEditStatus(study.status);
    setEditProtoKey(protoKey);
    setOrigStudyEdit({ name: study.name, description: study.description, status: study.status, protoKey });
    setShowEditStudy(true);
  };

  const handleSaveStudy = async () => {
    if (!editName.trim()) return;
    setSavingStudy(true);
    try {
      const selectedProto = editProtoKey
        ? prototypes.find((p) => `${p.prototyperId}:${p.id}` === editProtoKey)
        : null;

      const protoType = selectedProto
        ? selectedProto.url ? "link" : selectedProto.fileName ? "file" : "default"
        : null;

      // Capture previous values for undo
      const prev = {
        name: study!.name,
        description: study!.description,
        status: study!.status,
        prototypeId: study!.prototypeId ?? null,
        prototyperId: study!.prototyperId ?? null,
        prototypeTitle: study!.prototypeTitle ?? null,
        prototypeVariant: study!.prototypeVariant ?? null,
        prototypeType: study!.prototypeType ?? null,
        prototypeUrl: study!.prototypeUrl ?? null,
      };

      await updateDoc(doc(db, "studies", id), {
        name: editName.trim(),
        description: editDescription.trim(),
        status: editStatus,
        prototypeId: selectedProto?.id ?? null,
        prototyperId: selectedProto?.prototyperId ?? null,
        prototypeTitle: selectedProto?.title ?? null,
        prototypeVariant: selectedProto?.variant ?? null,
        prototypeType: protoType,
        prototypeUrl: selectedProto?.url || null,
      });
      setShowEditStudy(false);
      setToast({
        message: `Updated "${editName.trim()}"`,
        onUndo: () => {
          updateDoc(doc(db, "studies", id), prev).catch(console.error);
        },
      });
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
      const pName = allParticipants.find((x) => x.id === selectedParticipantId)?.name ?? "Participant";
      await updateDoc(doc(db, "participants", selectedParticipantId), {
        [`studyStatus.${id}`]: "invited",
      });
      setSelectedParticipantId("");
      setShowAddParticipant(false);
      setToast({ message: `Added "${pName}" to study` });
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
      const savedName = newParticipantName.trim();
      await addDoc(collection(db, "participants"), {
        name: savedName,
        email: newParticipantEmail.trim() || null,
        studyStatus: { [id]: "invited" },
        createdAt: serverTimestamp(),
      });
      setNewParticipantName("");
      setNewParticipantEmail("");
      setShowAddParticipant(false);
      setToast({ message: `Created and added "${savedName}" to study` });
    } catch (err) {
      console.error("Failed to create participant:", err);
    } finally {
      setSavingParticipant(false);
    }
  };

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<{ message: string; action: () => void } | null>(null);

  const handleCopyLink = async (p: Participant) => {
    const isLink = study?.prototypeType === "link" && study?.prototyperId && study?.prototypeId;
    const isUploaded = study?.prototypeType === "file" && study?.prototyperId && study?.prototypeId;
    const expectedBase = isLink
      ? `/prototype/link/${study.prototyperId}/${study.prototypeId}`
      : isUploaded
        ? `/prototype/uploaded/${study.prototyperId}/${study.prototypeId}`
        : "/prototype";
    // Use cached tokenUrl only if it was generated for THIS study and points to the correct prototype type
    const cachedUrl = p.tokenUrls?.[id];
    const cachedType = cachedUrl?.includes("/prototype/link/")
      ? "link"
      : cachedUrl?.includes("/prototype/uploaded/")
        ? "file"
        : "default";
    const cachedMatchesOrigin = cachedUrl?.startsWith(window.location.origin);
    if (cachedUrl && cachedMatchesOrigin && cachedType === (study?.prototypeType || "default")) {
      try {
        await navigator.clipboard.writeText(cachedUrl);
        setCopiedId(p.id);
        setTimeout(() => setCopiedId(null), 2000);
      } catch {
        prompt("Copy this link:", cachedUrl);
      }
      return;
    }
    // Generate a token (or regenerate if prototype URL changed)
    setGeneratingLink(p.id);
    try {
      const prototypeUrl = (isLink || isUploaded) ? expectedBase : undefined;
      const tokenRes = await fetch("/api/auth/participant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: p.id,
          studyId: id,
          name: p.name,
          prototypeVariant: study?.prototypeVariant,
          prototypeUrl,
        }),
      });
      if (!tokenRes.ok) {
        console.error("Token generation failed:", tokenRes.status);
        return;
      }
      const tokenData = await tokenRes.json();
      await updateDoc(doc(db, "participants", p.id), { [`tokenUrls.${id}`]: tokenData.url });
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
    const participant = participants.find((p) => p.id === participantId);
    const prevStatus = participant?.studyStatus?.[id];
    try {
      await updateDoc(doc(db, "participants", participantId), {
        [`studyStatus.${id}`]: deleteField(),
      });
      setToast({
        message: `Removed "${participant?.name ?? "Participant"}" from study`,
        onUndo: () => {
          updateDoc(doc(db, "participants", participantId), {
            [`studyStatus.${id}`]: prevStatus || "invited",
          }).catch(console.error);
        },
      });
    } catch (err) {
      console.error("Failed to remove participant:", err);
    }
  };

  const handleSummarizeSurvey = async () => {
    if (surveyResponses.length === 0) return;
    setSummarizing(true);
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          events: surveyResponses.map((r) => ({
            type: "survey_response",
            participantId: r.participantId,
            studyId: r.studyId,
            timestamp: r.submittedAt,
            data: {
              easeOfUse: r.easeOfUse,
              foundContent: r.foundContent,
              satisfaction: r.satisfaction,
              feedback: r.feedback,
            },
          })),
          studyId: id,
          studyName: study?.name,
          provider: "gemini",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        await updateDoc(doc(db, "studies", id), {
          aiSummary: data.summary,
          aiSummaryAt: serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("Failed to generate summary:", err);
    } finally {
      setSummarizing(false);
    }
  };

  // Participants not already assigned to this study
  const unassignedParticipants = allParticipants.filter(
    (p) => !p.studyStatus?.[id]
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
              <StatusBadge status={study.status} styleMap={STUDY_STATUS_STYLES} />
            </div>
            {study.createdAt && (
              <p className="mt-0.5 text-xs text-faint">
                Created{" "}
                {new Date(study.createdAt.seconds * 1000).toLocaleDateString()}
              </p>
            )}
            {study.description && (
              <p className="mt-1 text-sm text-secondary">{study.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
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
      <Dialog
        open={showEditStudy}
        onClose={confirmCloseEditStudy}
        title="Edit Study"
        onSubmit={handleSaveStudy}
        footer={
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              onClick={confirmCloseEditStudy}
              className="rounded-lg border border-edge-strong px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveStudy}
              disabled={!editName.trim() || savingStudy || !studyEditHasChanges}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingStudy ? "Saving..." : "Update Study"}
            </button>
          </div>
        }
      >
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
        </div>
      </Dialog>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Prototype" value={study.prototypeTitle || "None selected"}>
          {study.prototypeType === "link" && study.prototyperId && study.prototypeId ? (
            <Link
              href={`/prototype/link/${study.prototyperId}/${study.prototypeId}`}
              target="_blank"
              className="mt-2 inline-block rounded-lg border border-edge-strong px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-orange-500 hover:text-orange-400"
            >
              Preview
            </Link>
          ) : study.prototypeType === "file" && study.prototyperId && study.prototypeId ? (
            <Link
              href={`/prototype/uploaded/${study.prototyperId}/${study.prototypeId}`}
              target="_blank"
              className="mt-2 inline-block rounded-lg border border-edge-strong px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-orange-500 hover:text-orange-400"
            >
              Preview
            </Link>
          ) : (study.prototypeType === "default" || !study.prototypeType) && study.prototypeVariant ? (
            <Link
              href={`/prototype?variant=${study.prototypeVariant}`}
              target="_blank"
              className="mt-2 inline-block rounded-lg border border-edge-strong px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-orange-500 hover:text-orange-400"
            >
              Preview
            </Link>
          ) : null}
        </StatCard>
        <StatCard label="Participants" value={participants.length} />
        <StatCard label="Events Tracked" value={eventCount} />
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
        <Dialog
          open={showAddParticipant}
          onClose={() => setShowAddParticipant(false)}
          title="Add Participant"
          onSubmit={addMode === "existing" ? handleAddExistingParticipant : handleCreateParticipant}
          footer={
            addMode === "existing" ? (
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
            ) : (
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
            )
          }
        >
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
            </div>
          )}
        </Dialog>

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
                    {onlineParticipants.has(p.id) && (
                      <span className="relative flex h-2 w-2" title="Online — viewing prototype">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                      </span>
                    )}
                    {p.persona && (
                      <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-400">
                        {p.persona}
                      </span>
                    )}
                    <StatusBadge status={p.studyStatus?.[id] || "invited"} styleMap={PARTICIPANT_STATUS_STYLES} />
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
                    onClick={() => handleRemoveParticipant(p.id)}
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

      {/* Survey Responses */}
      <div className="mt-8 rounded-xl border border-edge bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Survey Responses</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">{surveyResponses.length} response{surveyResponses.length !== 1 ? "s" : ""}</span>
            {surveyResponses.length > 0 && (
              <button
                onClick={handleSummarizeSurvey}
                disabled={summarizing}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {summarizing ? "Summarizing..." : study?.aiSummary ? "Regenerate AI Summary" : "AI Summary"}
              </button>
            )}
          </div>
        </div>

        {study.aiSummary && (
          <div className="mb-4 rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-blue-400">AI Summary</h3>
              {study.aiSummaryAt && (
                <span className="text-[10px] text-faint">
                  {new Date(study.aiSummaryAt.seconds * 1000).toLocaleDateString()}{" "}
                  {new Date(study.aiSummaryAt.seconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
            <div className="prose prose-invert max-w-none text-sm text-secondary [&_strong]:text-foreground [&_li]:text-secondary [&_p]:text-secondary [&_ul]:my-1 [&_li]:my-0.5 [&_h2]:text-base [&_h3]:text-sm">
              <ReactMarkdown breaks>{study.aiSummary.replace(/\n/g, "\n\n")}</ReactMarkdown>
            </div>
          </div>
        )}

        {surveyResponses.length === 0 ? (
          <p className="text-sm text-muted">
            No survey responses yet. Participants can submit feedback from the prototype view.
          </p>
        ) : (
          <>
            {/* Aggregate stats */}
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              {([
                ["Ease of Use", "easeOfUse"],
                ["Found Content", "foundContent"],
                ["Satisfaction", "satisfaction"],
              ] as const).map(([label, key]) => {
                const counts = { easy: 0, neutral: 0, difficult: 0 };
                for (const r of surveyResponses) counts[r[key]]++;
                const total = surveyResponses.length;
                return (
                  <div key={key} className="rounded-lg border border-edge-strong bg-input p-3">
                    <p className="text-xs font-medium text-secondary mb-2">{label}</p>
                    <div className="space-y-1.5">
                      {(["easy", "neutral", "difficult"] as const).map((rating) => {
                        const pct = total > 0 ? Math.round((counts[rating] / total) * 100) : 0;
                        return (
                          <div key={rating} className="flex items-center gap-2">
                            <span className="text-[10px] text-muted w-14 capitalize">{rating}</span>
                            <div className="flex-1 h-2 rounded-full bg-subtle overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  rating === "easy"
                                    ? "bg-green-500"
                                    : rating === "neutral"
                                      ? "bg-amber-500"
                                      : "bg-red-500"
                                }`}
                                style={{ width: `${pct}%`, transition: "width 300ms ease" }}
                              />
                            </div>
                            <span className="text-[10px] text-muted w-8 text-right">{counts[rating]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Individual responses */}
            <div className="space-y-2">
              {surveyResponses.map((r) => {
                const participant = participants.find((p) => p.id === r.participantId);
                return (
                  <div key={r.id} className="rounded-lg border border-edge-strong bg-input p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-foreground">
                        {participant?.name || r.participantId}
                      </span>
                      <span className="text-[10px] text-faint">
                        {new Date(r.submittedAt).toLocaleDateString()}{" "}
                        {new Date(r.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-muted">Ease of Use:</span>
                      <span className={`rounded-full px-1.5 py-0.5 font-bold uppercase ${r.easeOfUse === "easy" ? "bg-green-500/20 text-green-400" : r.easeOfUse === "neutral" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>{r.easeOfUse}</span>
                      <span className="text-muted">Found Content:</span>
                      <span className={`rounded-full px-1.5 py-0.5 font-bold uppercase ${r.foundContent === "easy" ? "bg-green-500/20 text-green-400" : r.foundContent === "neutral" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>{r.foundContent}</span>
                      <span className="text-muted">Satisfaction:</span>
                      <span className={`rounded-full px-1.5 py-0.5 font-bold uppercase ${r.satisfaction === "easy" ? "bg-green-500/20 text-green-400" : r.satisfaction === "neutral" ? "bg-amber-500/20 text-amber-400" : "bg-red-500/20 text-red-400"}`}>{r.satisfaction}</span>
                    </div>
                    {r.feedback && (
                      <p className="mt-2 text-xs text-secondary italic">&ldquo;{r.feedback}&rdquo;</p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
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

      {toast && (
        <Toast
          message={toast.message}
          onUndo={toast.onUndo}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!confirmState}
        onClose={() => setConfirmState(null)}
        onConfirm={() => confirmState?.action()}
        title="Confirm"
        message={confirmState?.message ?? ""}
        confirmLabel="Confirm"
      />
    </div>
  );
}
