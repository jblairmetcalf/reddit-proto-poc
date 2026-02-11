import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type TrackingEventType =
  | "page_view"
  | "tab_switch"
  | "post_click"
  | "vote"
  | "comment_vote"
  | "search"
  | "community_click"
  | "flair_click"
  | "share_click"
  | "bookmark_click"
  | "create_post_open"
  | "create_post_close"
  | "comment_submit"
  | "sort_change"
  | "back_navigation"
  | "session_start"
  | "session_end"
  | "survey_open"
  | "survey_submit"
  | "survey_dismiss";

export interface TrackingEvent {
  type: TrackingEventType;
  sessionId: string;
  participantId?: string;
  studyId?: string;
  variant?: string;
  timestamp: number;
  data?: Record<string, unknown>;
  device?: DeviceInfo;
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  touchSupported: boolean;
}

function getDeviceInfo(): DeviceInfo {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    screenWidth: screen.width,
    screenHeight: screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    touchSupported: "ontouchstart" in window,
  };
}

let currentSessionId: string | null = null;

export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getSessionId(): string {
  if (!currentSessionId) {
    currentSessionId = generateSessionId();
  }
  return currentSessionId;
}

export async function trackEvent(
  type: TrackingEventType,
  data?: Record<string, unknown>,
  participantId?: string,
  studyId?: string,
  variant?: string
): Promise<void> {
  const event: TrackingEvent = {
    type,
    sessionId: getSessionId(),
    timestamp: Date.now(),
  };

  if (participantId) event.participantId = participantId;
  if (studyId) event.studyId = studyId;
  if (variant) event.variant = variant;
  if (data) event.data = data;

  if (typeof window !== "undefined") {
    event.device = getDeviceInfo();
  }

  try {
    await addDoc(collection(db, "events"), {
      ...event,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Tracking error:", err);
  }
}

export function startSession(participantId?: string, studyId?: string, variant?: string): string {
  currentSessionId = generateSessionId();
  trackEvent("session_start", undefined, participantId, studyId, variant);
  return currentSessionId;
}

export function endSession(participantId?: string, studyId?: string, variant?: string): void {
  trackEvent("session_end", undefined, participantId, studyId, variant);
  currentSessionId = null;
}
