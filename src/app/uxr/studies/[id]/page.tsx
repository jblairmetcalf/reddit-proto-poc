"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
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

interface Participant {
  id: string;
  name: string;
  email?: string;
  status: string;
  tokenUrl?: string;
  createdAt?: { seconds: number };
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-zinc-700 text-zinc-300",
  active: "bg-green-500/20 text-green-400",
  completed: "bg-blue-500/20 text-blue-400",
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
  const [eventCount, setEventCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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

  // Listen to event count for this study
  useEffect(() => {
    const q = query(collection(db, "events"), where("studyId", "==", id));
    const unsub = onSnapshot(q, (snap) => {
      setEventCount(snap.size);
    });
    return () => unsub();
  }, [id]);

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

  const variantConfig = study ? VARIANT_PRESETS[study.prototypeVariant] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-zinc-500">Loading study...</p>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="p-8">
        <p className="text-zinc-500">Study not found.</p>
        <Link
          href="/uxr/studies"
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
          href="/uxr/studies"
          className="mb-3 inline-block text-sm text-zinc-500 hover:text-white transition-colors"
        >
          &larr; Back to Studies
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{study.name}</h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${STATUS_STYLES[study.status]}`}
              >
                {study.status}
              </span>
            </div>
            {study.description && (
              <p className="mt-1 text-sm text-zinc-400">{study.description}</p>
            )}
            {study.createdAt && (
              <p className="mt-1 text-xs text-zinc-600">
                Created{" "}
                {new Date(study.createdAt.seconds * 1000).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/prototype?variant=${study.prototypeVariant}`}
              target="_blank"
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition-colors hover:border-orange-500 hover:text-orange-400"
            >
              Preview Prototype
            </Link>
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

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs font-medium uppercase text-zinc-500">Variant</p>
          <p className="mt-1 text-lg font-bold text-white">
            {study.prototypeVariant}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs font-medium uppercase text-zinc-500">
            Participants
          </p>
          <p className="mt-1 text-lg font-bold text-white">
            {participants.length}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs font-medium uppercase text-zinc-500">
            Events Tracked
          </p>
          <p className="mt-1 text-lg font-bold text-white">{eventCount}</p>
        </div>
      </div>

      {/* Variant Config Preview */}
      {variantConfig && (
        <div className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="mb-3 text-sm font-semibold text-white">
            Variant Configuration
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {([
              ["Default Sort", variantConfig.defaultSort],
              ["Feed Density", variantConfig.feedDensity],
              ["Show Awards", variantConfig.showAwards ? "Yes" : "No"],
              ["Show Flairs", variantConfig.showFlairs ? "Yes" : "No"],
              ["Show Vote Count", variantConfig.showVoteCount ? "Yes" : "No"],
              ["Comment Sort", variantConfig.commentSort],
            ] as const).map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-lg bg-zinc-800 px-3 py-2">
                <span className="text-xs text-zinc-500">{label}</span>
                <span className="text-xs font-medium text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Participants */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Participants</h2>
          <Link
            href="/uxr/participants"
            className="text-xs text-orange-400 hover:underline"
          >
            Manage Participants
          </Link>
        </div>
        {participants.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No participants assigned to this study yet.
          </p>
        ) : (
          <div className="space-y-2">
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-white">{p.name}</p>
                  {p.email && (
                    <p className="text-xs text-zinc-500">{p.email}</p>
                  )}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    p.status === "active"
                      ? "bg-green-500/20 text-green-400"
                      : p.status === "completed"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
