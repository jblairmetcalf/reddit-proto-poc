"use client";

import { useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

interface UsePresenceOptions {
  participantId?: string;
  studyId?: string;
}

const HEARTBEAT_INTERVAL = 30_000; // 30 seconds

function getPresenceDocId(participantId: string, studyId: string) {
  return `${participantId}_${studyId}`;
}

export function usePresence({ participantId, studyId }: UsePresenceOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    if (!participantId || !studyId) return;

    const docId = getPresenceDocId(participantId, studyId);
    const presenceRef = doc(db, "presence", docId);

    function sendHeartbeat() {
      setDoc(presenceRef, {
        participantId,
        studyId,
        lastSeen: serverTimestamp(),
      }, { merge: true }).catch(console.error);
    }

    function startHeartbeat() {
      if (activeRef.current) return;
      activeRef.current = true;
      sendHeartbeat();
      intervalRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    }

    function stopHeartbeat() {
      if (!activeRef.current) return;
      activeRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    function goOffline() {
      stopHeartbeat();
      deleteDoc(presenceRef).catch(() => {});
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        startHeartbeat();
      } else {
        goOffline();
      }
    }

    function handleBeforeUnload() {
      // sendBeacon reliably delivers even during page unload
      const payload = JSON.stringify({ participantId, studyId });
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/presence/offline", blob);
    }

    // Start immediately
    startHeartbeat();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);

    return () => {
      stopHeartbeat();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);
      deleteDoc(presenceRef).catch(() => {});
    };
  }, [participantId, studyId]);
}
