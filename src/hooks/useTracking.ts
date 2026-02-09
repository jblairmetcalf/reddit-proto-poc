"use client";

import { useCallback, useEffect, useRef } from "react";
import { trackEvent, startSession, endSession, type TrackingEventType } from "@/lib/tracking";

interface UseTrackingOptions {
  participantId?: string;
  studyId?: string;
  variant?: string;
}

export function useTracking(participantIdOrOptions?: string | UseTrackingOptions) {
  const opts: UseTrackingOptions =
    typeof participantIdOrOptions === "string"
      ? { participantId: participantIdOrOptions }
      : participantIdOrOptions ?? {};

  const { participantId, studyId, variant } = opts;
  const sessionStarted = useRef(false);

  useEffect(() => {
    if (!sessionStarted.current) {
      startSession(participantId, studyId, variant);
      sessionStarted.current = true;
    }

    const handleBeforeUnload = () => endSession(participantId, studyId, variant);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [participantId, studyId, variant]);

  const track = useCallback(
    (type: TrackingEventType, data?: Record<string, unknown>) => {
      trackEvent(type, data, participantId, studyId, variant);
    },
    [participantId, studyId, variant]
  );

  return { track };
}
