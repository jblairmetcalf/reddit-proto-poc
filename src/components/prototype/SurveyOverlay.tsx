"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import type { TrackingEventType } from "@/lib/tracking";

type Rating = "easy" | "neutral" | "difficult";

interface SurveyResponse {
  easeOfUse: Rating;
  foundContent: Rating;
  satisfaction: Rating;
  feedback: string | null;
}

interface SurveyOverlayProps {
  participantId: string;
  studyId: string;
  variant?: string;
  sessionId: string;
  onTrack: (event: string, data?: Record<string, unknown>) => void;
}

const surveyStyles = `
  @keyframes surveySlideIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes surveyFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const QUESTIONS: { label: string; key: keyof Pick<SurveyResponse, "easeOfUse" | "foundContent" | "satisfaction"> }[] = [
  { label: "Overall, how easy was this experience?", key: "easeOfUse" },
  { label: "Did you find what you were looking for?", key: "foundContent" },
  { label: "How satisfied are you with the experience?", key: "satisfaction" },
];

export default function SurveyOverlay({
  participantId,
  studyId,
  variant,
  sessionId,
  onTrack,
}: SurveyOverlayProps) {
  const [previousResponse, setPreviousResponse] = useState<SurveyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [easeOfUse, setEaseOfUse] = useState<Rating | null>(null);
  const [foundContent, setFoundContent] = useState<Rating | null>(null);
  const [satisfaction, setSatisfaction] = useState<Rating | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Check Firestore for existing response
  useEffect(() => {
    const checkExisting = async () => {
      try {
        const q = query(
          collection(db, "survey_responses"),
          where("participantId", "==", participantId),
          where("studyId", "==", studyId)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const data = snap.docs[0].data() as SurveyResponse;
          setPreviousResponse(data);
        }
      } catch (err) {
        console.error("Failed to check existing survey:", err);
      } finally {
        setLoading(false);
      }
    };
    checkExisting();
  }, [participantId, studyId]);

  if (loading) return null;

  const hasSubmitted = !!previousResponse;
  const canSubmit = easeOfUse && foundContent && satisfaction && !submitting;

  const handleOpen = () => {
    setShowModal(true);
    if (!hasSubmitted) {
      onTrack("survey_open" as TrackingEventType);
    }
  };

  const handleDismiss = () => {
    setShowModal(false);
    if (!hasSubmitted) {
      onTrack("survey_dismiss" as TrackingEventType);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "survey_responses"), {
        participantId,
        studyId,
        variant: variant || null,
        sessionId,
        easeOfUse,
        foundContent,
        satisfaction,
        feedback: feedback.trim() || null,
        submittedAt: Date.now(),
        createdAt: serverTimestamp(),
      });
      onTrack("survey_submit" as TrackingEventType, {
        easeOfUse,
        foundContent,
        satisfaction,
        hasFeedback: !!feedback.trim(),
      });
      updateDoc(doc(db, "participants", participantId), { status: "completed" }).catch(console.error);
      setPreviousResponse({ easeOfUse, foundContent, satisfaction, feedback: feedback.trim() || null });
      setShowModal(false);
    } catch (err) {
      console.error("Failed to submit survey:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const ratingBadge = (value: Rating) => (
    <span
      style={{
        padding: "6px 12px",
        borderRadius: "8px",
        border: "2px solid var(--reddit-orange, #FF4500)",
        background: "rgba(255, 69, 0, 0.1)",
        color: "var(--reddit-text-primary, #D7DADC)",
        fontSize: "13px",
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {value}
    </span>
  );

  const ratingButtons = (
    value: Rating | null,
    onChange: (r: Rating) => void
  ) => (
    <div style={{ display: "flex", gap: "8px" }}>
      {(["easy", "neutral", "difficult"] as const).map((r) => (
        <button
          key={r}
          type="button"
          onClick={() => onChange(r)}
          style={{
            flex: 1,
            padding: "10px 4px",
            borderRadius: "8px",
            border:
              value === r
                ? "2px solid var(--reddit-orange, #FF4500)"
                : "1px solid var(--reddit-border-strong, #4F4F51)",
            background:
              value === r
                ? "rgba(255, 69, 0, 0.1)"
                : "var(--reddit-bg-elevated, #272729)",
            color: "var(--reddit-text-primary, #D7DADC)",
            fontSize: "13px",
            fontWeight: value === r ? 600 : 400,
            cursor: "pointer",
            textTransform: "capitalize",
            transition: "all 150ms ease",
          }}
        >
          {r}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <style>{surveyStyles}</style>

      {/* Floating button */}
      {!showModal && (
        <button
          onClick={handleOpen}
          style={{
            position: "fixed",
            bottom: "84px",
            right: "16px",
            background: hasSubmitted
              ? "var(--reddit-bg-elevated, #272729)"
              : "var(--reddit-orange, #FF4500)",
            color: hasSubmitted
              ? "var(--reddit-text-secondary, #818384)"
              : "#fff",
            border: hasSubmitted
              ? "1px solid var(--reddit-border-strong, #4F4F51)"
              : "none",
            borderRadius: "20px",
            padding: "10px 18px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            zIndex: 9000,
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            animation: "surveySlideIn 0.4s ease forwards",
          }}
        >
          {hasSubmitted ? "View Feedback" : "Give Feedback"}
        </button>
      )}

      {/* Modal overlay */}
      {showModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) handleDismiss();
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 9500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            animation: "surveyFadeIn 0.2s ease",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "380px",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "var(--reddit-bg-surface, #1A1A1B)",
              borderRadius: "16px",
              border: "1px solid var(--reddit-border-strong, #4F4F51)",
              padding: "24px",
              animation: "surveySlideIn 0.3s ease",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "20px",
              }}
            >
              <p
                style={{
                  color: "var(--reddit-text-secondary, #818384)",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  flex: 1,
                  marginRight: "12px",
                }}
              >
                {hasSubmitted
                  ? "Thanks for your feedback! Here are your responses."
                  : "Thanks for using our product! This quick survey takes under 30 seconds."}
              </p>
              <button
                onClick={handleDismiss}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--reddit-text-secondary, #818384)",
                  fontSize: "20px",
                  cursor: "pointer",
                  padding: "0 4px",
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                &times;
              </button>
            </div>

            {hasSubmitted ? (
              /* Read-only view of previous responses */
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {QUESTIONS.map(({ label, key }) => (
                  <div key={key}>
                    <p
                      style={{
                        color: "var(--reddit-text-primary, #D7DADC)",
                        fontSize: "14px",
                        fontWeight: 600,
                        marginBottom: "8px",
                      }}
                    >
                      {label}
                    </p>
                    {ratingBadge(previousResponse[key])}
                  </div>
                ))}

                <div>
                  <p
                    style={{
                      color: "var(--reddit-text-primary, #D7DADC)",
                      fontSize: "14px",
                      fontWeight: 600,
                      marginBottom: "8px",
                    }}
                  >
                    What could we improve?
                  </p>
                  <p
                    style={{
                      color: "var(--reddit-text-secondary, #818384)",
                      fontSize: "13px",
                      fontStyle: previousResponse.feedback ? "italic" : "normal",
                    }}
                  >
                    {previousResponse.feedback || "No feedback provided"}
                  </p>
                </div>
              </div>
            ) : (
              /* Survey form */
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {QUESTIONS.map(({ label, key }) => {
                  const value = key === "easeOfUse" ? easeOfUse : key === "foundContent" ? foundContent : satisfaction;
                  const setter = key === "easeOfUse" ? setEaseOfUse : key === "foundContent" ? setFoundContent : setSatisfaction;
                  return (
                    <div key={key}>
                      <p
                        style={{
                          color: "var(--reddit-text-primary, #D7DADC)",
                          fontSize: "14px",
                          fontWeight: 600,
                          marginBottom: "8px",
                        }}
                      >
                        {label}
                      </p>
                      {ratingButtons(value, setter)}
                    </div>
                  );
                })}

                <div>
                  <p
                    style={{
                      color: "var(--reddit-text-primary, #D7DADC)",
                      fontSize: "14px",
                      fontWeight: 600,
                      marginBottom: "8px",
                    }}
                  >
                    What could we improve?{" "}
                    <span
                      style={{
                        fontWeight: 400,
                        color: "var(--reddit-text-secondary, #818384)",
                      }}
                    >
                      (Optional)
                    </span>
                  </p>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Your thoughts..."
                    rows={3}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: "1px solid var(--reddit-border-strong, #4F4F51)",
                      background: "var(--reddit-bg-elevated, #272729)",
                      color: "var(--reddit-text-primary, #D7DADC)",
                      fontSize: "13px",
                      resize: "none",
                      outline: "none",
                      fontFamily: "inherit",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "20px",
                    border: "none",
                    background: canSubmit
                      ? "var(--reddit-orange, #FF4500)"
                      : "var(--reddit-bg-elevated, #272729)",
                    color: canSubmit
                      ? "#fff"
                      : "var(--reddit-text-secondary, #818384)",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: canSubmit ? "pointer" : "not-allowed",
                    transition: "all 150ms ease",
                    marginTop: "4px",
                  }}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
