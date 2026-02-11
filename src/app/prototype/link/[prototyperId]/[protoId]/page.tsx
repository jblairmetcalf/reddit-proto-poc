"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import SurveyOverlay from "@/components/reddit/SurveyOverlay";
import { getSessionId } from "@/lib/tracking";
import { useTracking } from "@/hooks/useTracking";

interface Prototype {
  title: string;
  url: string;
}

function LinkPreviewContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const prototyperId = params.prototyperId as string;
  const protoId = params.protoId as string;
  const token = searchParams.get("token");

  const [proto, setProto] = useState<Prototype | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [participantId, setParticipantId] = useState<string | undefined>();
  const [studyId, setStudyId] = useState<string | undefined>();
  const [variant, setVariant] = useState<string | undefined>();

  const { track } = useTracking({ participantId, studyId, variant });

  const handleTrack = (event: string, data?: Record<string, unknown>) => {
    track(event as Parameters<typeof track>[0], data);
  };

  // Verify participant token
  useEffect(() => {
    if (!token) return;
    fetch(`/api/auth/participant?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setParticipantId(data.participantId);
          setStudyId(data.studyId);
          if (data.prototypeVariant) setVariant(data.prototypeVariant);
          // Update participant study status to viewed (only if currently invited)
          const pRef = doc(db, "participants", data.participantId);
          getDoc(pRef).then((snap) => {
            if (snap.exists()) {
              const studyStatus = snap.data().studyStatus || {};
              if (!studyStatus[data.studyId] || studyStatus[data.studyId] === "invited") {
                updateDoc(pRef, { [`studyStatus.${data.studyId}`]: "viewed" });
              }
            }
          }).catch(console.error);
        }
      })
      .catch(console.error);
  }, [token]);

  // Fetch prototype data
  useEffect(() => {
    async function fetchProto() {
      try {
        const snap = await getDoc(
          doc(db, "prototypers", prototyperId, "prototypes", protoId)
        );
        if (snap.exists()) {
          setProto(snap.data() as Prototype);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchProto();
  }, [prototyperId, protoId]);

  const isParticipant = !!token && !!participantId && !!studyId;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (error || !proto) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-500">Prototype not found.</p>
      </div>
    );
  }

  if (!proto.url) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-500">No URL set for this prototype.</p>
      </div>
    );
  }

  return (
    <>
      <iframe
        src={proto.url}
        title={proto.title}
        className="h-screen w-screen border-0"
        allow="fullscreen"
      />
      {isParticipant && (
        <SurveyOverlay
          participantId={participantId}
          studyId={studyId}
          variant={variant}
          sessionId={getSessionId()}
          onTrack={handleTrack}
        />
      )}
    </>
  );
}

export default function LinkPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      }
    >
      <LinkPreviewContent />
    </Suspense>
  );
}
