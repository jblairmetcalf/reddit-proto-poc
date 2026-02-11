"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface Prototype {
  title: string;
  fileName: string;
  fileUrl: string;
}

function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export default function UploadedPreviewPage() {
  const params = useParams();
  const prototyperId = params.prototyperId as string;
  const protoId = params.protoId as string;

  const [proto, setProto] = useState<Prototype | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
  const isPdf = ext === "pdf";

  if (isHtml || isPdf) {
    return (
      <iframe
        src={proto.fileUrl}
        title={proto.title}
        className="h-screen w-screen border-0"
      />
    );
  }

  if (isImage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8">
        <img
          src={proto.fileUrl}
          alt={proto.title}
          className="max-h-[90vh] max-w-full rounded-lg"
        />
      </div>
    );
  }

  // Fallback: download link
  return (
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
  );
}
