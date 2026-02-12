"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Toast from "@/components/infrastructure/Toast";
import { Dialog, ConfirmDialog, StatusBadge, EmptyState, STUDY_STATUS_STYLES } from "@/components/infrastructure";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  deleteDoc,
  deleteField,
  getDocs,
  query,
  where,
  doc,
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

export default function StudiesPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProtoKey, setSelectedProtoKey] = useState("");
  const [status, setStatus] = useState<"draft" | "active" | "completed">("draft");
  const [saving, setSaving] = useState(false);
  const [confirmState, setConfirmState] = useState<{ message: string; action: () => void } | null>(null);

  // Listen to studies
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "studies"), (snap) => {
      const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Study, "id">) }));
      docs.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setStudies(docs);
    });
    return () => unsub();
  }, []);

  // Listen to prototypers + their prototypes
  const [prototypers, setPrototypers] = useState<Prototyper[]>([]);

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

  // Listen to participants for status counts
  interface ParticipantDoc {
    id: string;
    studyStatus?: Record<string, string>;
  }
  const [allParticipants, setAllParticipants] = useState<ParticipantDoc[]>([]);
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "participants"), (snap) => {
      setAllParticipants(
        snap.docs.map((d) => ({
          id: d.id,
          studyStatus: (d.data() as { studyStatus?: Record<string, string> }).studyStatus,
        }))
      );
    });
    return () => unsub();
  }, []);

  // Listen to presence for online indicators
  interface PresenceDoc {
    participantId: string;
    studyId: string;
    lastSeen?: { toMillis?: () => number };
  }
  const [presenceDocs, setPresenceDocs] = useState<PresenceDoc[]>([]);
  useEffect(() => {
    const STALE_MS = 90_000;
    const unsub = onSnapshot(collection(db, "presence"), (snap) => {
      const now = Date.now();
      setPresenceDocs(
        snap.docs
          .map((d) => d.data() as PresenceDoc)
          .filter((p) => {
            const lastSeen = p.lastSeen?.toMillis?.();
            return p.participantId && (!lastSeen || now - lastSeen < STALE_MS);
          })
      );
    });
    return () => unsub();
  }, []);

  // Derive per-study participant counts
  const studyCounts = useMemo(() => {
    const counts: Record<string, { online: number; invited: number; viewed: number; completed: number }> = {};
    for (const study of studies) {
      const sid = study.id;
      let invited = 0, viewed = 0, completed = 0;
      for (const p of allParticipants) {
        const status = p.studyStatus?.[sid];
        if (status === "invited") invited++;
        else if (status === "viewed") viewed++;
        else if (status === "completed") completed++;
      }
      const online = presenceDocs.filter((d) => d.studyId === sid).length;
      counts[sid] = { online, invited, viewed, completed };
    }
    return counts;
  }, [studies, allParticipants, presenceDocs]);

  function resetForm() {
    setName("");
    setDescription("");
    setSelectedProtoKey("");
    setStatus("draft");
    setEditingId(null);
  }

  function openCreate() {
    resetForm();
    setShowForm(true);
  }

  const [origStudy, setOrigStudy] = useState({ name: "", description: "", protoKey: "", status: "" });
  const [toast, setToast] = useState<{ message: string; onUndo?: () => void } | null>(null);

  function openEdit(study: Study) {
    const protoKey = study.prototypeId && study.prototyperId
      ? `${study.prototyperId}:${study.prototypeId}`
      : "";
    setName(study.name);
    setDescription(study.description);
    setSelectedProtoKey(protoKey);
    setStatus(study.status);
    setEditingId(study.id);
    setOrigStudy({ name: study.name, description: study.description, protoKey, status: study.status });
    setShowForm(true);
  }

  const editHasChanges = editingId != null && (name !== origStudy.name || description !== origStudy.description || selectedProtoKey !== origStudy.protoKey || status !== origStudy.status);

  function closeForm() {
    resetForm();
    setShowForm(false);
  }

  function confirmCloseForm() {
    if (editHasChanges && !window.confirm("You have unsaved changes. Discard them?")) return;
    closeForm();
  }

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      // Parse selected prototype
      const selectedProto = selectedProtoKey
        ? prototypes.find((p) => `${p.prototyperId}:${p.id}` === selectedProtoKey)
        : null;

      const protoType = selectedProto
        ? selectedProto.url ? "link" : selectedProto.fileName ? "file" : "default"
        : null;

      const data: Record<string, unknown> = {
        name: name.trim(),
        description: description.trim(),
        prototypeId: selectedProto?.id ?? null,
        prototyperId: selectedProto?.prototyperId ?? null,
        prototypeTitle: selectedProto?.title ?? null,
        prototypeVariant: selectedProto?.variant ?? null,
        prototypeType: protoType,
        prototypeUrl: selectedProto?.url || null,
      };

      if (editingId) {
        const prevId = editingId;
        const prev = { ...origStudy };
        data.status = status;
        await updateDoc(doc(db, "studies", editingId), data);
        // Find original prototype for undo
        const origProto = prev.protoKey
          ? prototypes.find((p) => `${p.prototyperId}:${p.id}` === prev.protoKey)
          : null;
        const origProtoType = origProto
          ? origProto.url ? "link" : origProto.fileName ? "file" : "default"
          : null;
        setToast({
          message: `Updated "${name.trim()}"`,
          onUndo: () => {
            updateDoc(doc(db, "studies", prevId), {
              name: prev.name,
              description: prev.description,
              status: prev.status,
              prototypeId: origProto?.id ?? null,
              prototyperId: origProto?.prototyperId ?? null,
              prototypeTitle: origProto?.title ?? null,
              prototypeVariant: origProto?.variant ?? null,
              prototypeType: origProtoType,
            }).catch(console.error);
          },
        });
      } else {
        data.status = "draft";
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, "studies"), data);
      }
      closeForm();
    } catch (err) {
      console.error("Failed to save study:", err);
    } finally {
      setSaving(false);
    }
  };

  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());
  const undoneRef = useRef<Set<string>>(new Set());

  const actuallyDelete = async (id: string) => {
    if (undoneRef.current.has(id)) {
      undoneRef.current.delete(id);
      return;
    }
    try {
      // Delete outcomes subcollection
      const outcomesSnap = await getDocs(collection(db, "studies", id, "outcomes"));
      await Promise.all(outcomesSnap.docs.map((d) => deleteDoc(d.ref)));

      // Delete events for this study
      const eventsSnap = await getDocs(query(collection(db, "events"), where("studyId", "==", id)));
      await Promise.all(eventsSnap.docs.map((d) => deleteDoc(d.ref)));

      // Delete survey responses for this study
      const surveySnap = await getDocs(query(collection(db, "survey_responses"), where("studyId", "==", id)));
      await Promise.all(surveySnap.docs.map((d) => deleteDoc(d.ref)));

      // Remove this study's status from participants (keep them in the platform)
      const participantsSnap = await getDocs(query(collection(db, "participants"), where("studyId", "==", id)));
      await Promise.all(participantsSnap.docs.map((d) => updateDoc(d.ref, { [`studyStatus.${id}`]: deleteField() })));

      // Delete the study itself
      await deleteDoc(doc(db, "studies", id));
    } catch (err) {
      console.error("Failed to delete study:", err);
    } finally {
      setPendingDeletes((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  const handleDelete = (id: string) => {
    const studyName = studies.find((s) => s.id === id)?.name ?? "Study";
    setPendingDeletes((prev) => new Set(prev).add(id));
    setToast({
      message: `Deleted "${studyName}"`,
      onUndo: () => {
        undoneRef.current.add(id);
        setPendingDeletes((prev) => { const next = new Set(prev); next.delete(id); return next; });
      },
    });
  };

  // Perform actual delete when toast dismisses
  const handleToastDismiss = () => {
    const pending = Array.from(pendingDeletes);
    setToast(null);
    pending.forEach((id) => actuallyDelete(id));
  };

  return (
    <div className="p-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Studies</h1>
          <p className="mt-1 text-sm text-secondary">
            Create and manage UX research studies
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
        >
          New Study
        </button>
      </header>

      {/* Create / Edit dialog */}
      <Dialog
        open={showForm}
        onClose={confirmCloseForm}
        title={editingId ? "Edit Study" : "Create Study"}
        onSubmit={handleSave}
        footer={
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              onClick={confirmCloseForm}
              className="rounded-lg border border-edge-strong px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || saving || (editingId != null && !editHasChanges)}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Study"
                  : "Create Study"}
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Feed Sorting Experiment"
              className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-secondary">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                value={selectedProtoKey}
                onChange={(e) => setSelectedProtoKey(e.target.value)}
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
              {prototypes.length === 0 && (
                <p className="mt-1 text-xs text-faint">
                  Add prototypes from the Prototypers page first.
                </p>
              )}
            </div>
            {editingId && (
              <div>
                <label className="mb-1 block text-xs font-medium text-secondary">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value as "draft" | "active" | "completed")
                  }
                  className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </Dialog>

      {/* Studies list */}
      {studies.length === 0 ? (
        <EmptyState message="No studies yet. Create one to get started." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {studies.filter((s) => !pendingDeletes.has(s.id)).map((study) => (
            <div
              key={study.id}
              className="group relative rounded-xl border border-edge bg-card p-6 transition-colors hover:border-orange-600"
            >
              <Link
                href={`/user-research/studies/${study.id}`}
                className="absolute inset-0 rounded-xl"
              />
              <div className="flex items-center justify-between">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <h3 className="truncate text-lg font-semibold text-foreground group-hover:text-orange-400">
                    {study.name}
                  </h3>
                  {studyCounts[study.id]?.online > 0 && (
                    <span className="flex shrink-0 items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                      </span>
                      <span className="text-xs text-green-400">{studyCounts[study.id].online}</span>
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setConfirmState({
                      message: `Delete "${study.name}" and all its events, survey responses, and outcomes? Participants will be unassigned but kept in the platform.`,
                      action: () => handleDelete(study.id),
                    });
                  }}
                  className="relative z-10 shrink-0 rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  Delete
                </button>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <StatusBadge status={study.status} styleMap={STUDY_STATUS_STYLES} />
                {(() => {
                  const c = studyCounts[study.id];
                  if (!c) return null;
                  const hasParticipants = c.invited + c.viewed + c.completed > 0;
                  if (!hasParticipants) return null;
                  return (
                    <>
                      <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-400">{c.invited} Invited</span>
                      <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-medium text-cyan-400">{c.viewed} Viewed</span>
                      <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-medium text-blue-400">{c.completed} Completed</span>
                    </>
                  );
                })()}
              </div>
              <p className="mt-1.5 text-xs text-muted">
                {study.prototypeTitle || "No prototype selected"}
              </p>
              {study.createdAt && (
                <p className="mt-0.5 text-xs text-muted">
                  {new Date(study.createdAt.seconds * 1000).toLocaleDateString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!confirmState}
        onClose={() => setConfirmState(null)}
        onConfirm={() => confirmState?.action()}
        message={confirmState?.message ?? ""}
      />
      {toast && (
        <Toast message={toast.message} onUndo={toast.onUndo} onDismiss={handleToastDismiss} />
      )}
    </div>
  );
}
