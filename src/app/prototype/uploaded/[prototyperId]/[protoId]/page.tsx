"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import SurveyOverlay from "@/components/reddit/SurveyOverlay";
import CommentPanel from "@/components/prototype/CommentPanel";
import { getSessionId } from "@/lib/tracking";
import { useTracking } from "@/hooks/useTracking";
import { usePresence } from "@/hooks/usePresence";

interface Prototype {
  title: string;
  fileName: string;
  fileUrl: string;
}

function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function UploadedPreviewContent() {
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
  usePresence({ participantId, studyId });

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

  const surveyOverlay = isParticipant ? (
    <SurveyOverlay
      participantId={participantId}
      studyId={studyId}
      variant={variant}
      sessionId={getSessionId()}
      onTrack={handleTrack}
    />
  ) : null;

  const commentPanel = !isParticipant ? (
    <CommentPanel prototyperId={prototyperId} protoId={protoId} />
  ) : null;

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

  if (!proto.fileUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-500">
          No file uploaded for this prototype.
        </p>
      </div>
    );
  }

  const ext = getFileExtension(proto.fileName);
  const imageExts = ["png", "jpg", "jpeg", "gif", "svg", "webp"];
  const isImage = imageExts.includes(ext);
  const isHtml = ext === "html" || ext === "htm";
  const isJsx = ext === "jsx" || ext === "tsx";
  const isZip = ext === "zip";
  const isPdf = ext === "pdf";

  // HTML, JSX/TSX → serve via API proxy
  if (isHtml || isJsx) {
    return (
      <>
        <iframe
          src={`/api/prototype/serve/${prototyperId}/${protoId}/${proto.fileName}`}
          title={proto.title}
          sandbox="allow-scripts"
          className="h-screen w-screen border-0"
        />
        {surveyOverlay}
        {commentPanel}
      </>
    );
  }

  // ZIP → serve index.html from extracted archive via API proxy
  if (isZip) {
    return (
      <>
        <iframe
          src={`/api/prototype/serve/${prototyperId}/${protoId}/index.html`}
          title={proto.title}
          sandbox="allow-scripts"
          className="h-screen w-screen border-0"
        />
        {surveyOverlay}
        {commentPanel}
      </>
    );
  }

  // PDF → direct URL works fine
  if (isPdf) {
    return (
      <>
        <iframe
          src={proto.fileUrl}
          title={proto.title}
          className="h-screen w-screen border-0"
        />
        {surveyOverlay}
        {commentPanel}
      </>
    );
  }

  if (isImage) {
    return (
      <>
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8">
          <img
            src={proto.fileUrl}
            alt={proto.title}
            className="max-h-[90vh] max-w-full rounded-lg"
          />
        </div>
        {surveyOverlay}
        {commentPanel}
      </>
    );
  }

  // Fallback: download link
  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950">
        <p className="text-sm text-zinc-400">{proto.fileName}</p>
        <a
          href={proto.fileUrl}
          download={proto.fileName}
          className="rounded-lg bg-orange-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-500"
        >
          Download File
        </a>
      </div>
      {surveyOverlay}
      {commentPanel}
    </>
  );
}

export default function UploadedPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      }
    >
      <UploadedPreviewContent />
    </Suspense>
  );
}
