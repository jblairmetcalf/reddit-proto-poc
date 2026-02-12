"use client";

import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";

interface Comment {
  id: string;
  text: string;
  createdAt: Timestamp | null;
}

interface CommentPanelProps {
  prototyperId: string;
  protoId: string;
}

function prettyDate(ts: Timestamp | null): string {
  if (!ts) return "just now";
  const now = Date.now();
  const then = ts.toMillis();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 10) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const date = ts.toDate();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const panelStyles = `
  @keyframes commentPanelSlideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  @keyframes commentPanelSlideOut {
    from { transform: translateX(0); }
    to { transform: translateX(100%); }
  }
  @keyframes commentBackdropIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes commentBackdropOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  @keyframes commentBtnIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export default function CommentPanel({ prototyperId, protoId }: CommentPanelProps) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const commentsRef = collection(
    db,
    "prototypers",
    prototyperId,
    "prototypes",
    protoId,
    "comments"
  );

  useEffect(() => {
    const q = query(commentsRef, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setComments(
        snap.docs.map((d) => ({
          id: d.id,
          text: d.data().text,
          createdAt: d.data().createdAt,
        }))
      );
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prototyperId, protoId]);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [comments, open]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 150);
  };

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await addDoc(commentsRef, {
        text: trimmed,
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{panelStyles}</style>

      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: "84px",
            right: "16px",
            background: "var(--reddit-bg-elevated, #272729)",
            color: "var(--reddit-text-secondary, #818384)",
            border: "1px solid var(--reddit-border-strong, #4F4F51)",
            borderRadius: "20px",
            padding: "10px 18px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            zIndex: 9000,
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            animation: "commentBtnIn 0.4s ease forwards",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Leave a Comment
          {comments.length > 0 && (
            <span
              style={{
                background: "var(--reddit-orange, #FF4500)",
                color: "#fff",
                borderRadius: "10px",
                padding: "1px 7px",
                fontSize: "11px",
                fontWeight: 700,
                marginLeft: "2px",
              }}
            >
              {comments.length}
            </span>
          )}
        </button>
      )}

      {/* Backdrop + Panel */}
      {(open || closing) && (
        <>
          {/* Backdrop */}
          <div
            onClick={handleClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 9400,
              animation: closing
                ? "commentBackdropOut 150ms ease forwards"
                : "commentBackdropIn 150ms ease forwards",
            }}
          />

          {/* Panel */}
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "380px",
              maxWidth: "100vw",
              background: "var(--reddit-bg-surface, #1A1A1B)",
              borderLeft: "1px solid var(--reddit-border-strong, #4F4F51)",
              zIndex: 9500,
              display: "flex",
              flexDirection: "column",
              animation: closing
                ? "commentPanelSlideOut 150ms ease forwards"
                : "commentPanelSlideIn 150ms ease forwards",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid var(--reddit-border-strong, #4F4F51)",
                flexShrink: 0,
              }}
            >
              <h2
                style={{
                  color: "var(--reddit-text-primary, #D7DADC)",
                  fontSize: "16px",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Comments{" "}
                <span
                  style={{
                    color: "var(--reddit-text-secondary, #818384)",
                    fontWeight: 400,
                    fontSize: "14px",
                  }}
                >
                  ({comments.length})
                </span>
              </h2>
              <button
                onClick={handleClose}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--reddit-text-secondary, #818384)",
                  fontSize: "22px",
                  cursor: "pointer",
                  padding: "0 4px",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            {/* Comment list */}
            <div
              ref={listRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 20px",
              }}
            >
              {comments.length === 0 ? (
                <p
                  style={{
                    color: "var(--reddit-text-secondary, #818384)",
                    fontSize: "13px",
                    textAlign: "center",
                    marginTop: "40px",
                  }}
                >
                  No comments yet. Be the first!
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        background: "var(--reddit-bg-elevated, #272729)",
                        borderRadius: "10px",
                        padding: "12px 14px",
                        border: "1px solid var(--reddit-border, #343536)",
                      }}
                    >
                      <p
                        style={{
                          color: "var(--reddit-text-primary, #D7DADC)",
                          fontSize: "14px",
                          lineHeight: "1.5",
                          margin: "0 0 6px 0",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {c.text}
                      </p>
                      <p
                        style={{
                          color: "var(--reddit-text-secondary, #818384)",
                          fontSize: "11px",
                          margin: 0,
                        }}
                      >
                        {prettyDate(c.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Input area */}
            <div
              style={{
                padding: "12px 20px 16px",
                borderTop: "1px solid var(--reddit-border-strong, #4F4F51)",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", gap: "8px" }}>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Write a comment..."
                  rows={2}
                  style={{
                    flex: 1,
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
                <button
                  onClick={handleSubmit}
                  disabled={!text.trim() || submitting}
                  style={{
                    alignSelf: "flex-end",
                    padding: "10px 16px",
                    borderRadius: "20px",
                    border: "none",
                    background:
                      text.trim() && !submitting
                        ? "var(--reddit-orange, #FF4500)"
                        : "var(--reddit-bg-elevated, #272729)",
                    color:
                      text.trim() && !submitting
                        ? "#fff"
                        : "var(--reddit-text-secondary, #818384)",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: text.trim() && !submitting ? "pointer" : "not-allowed",
                    transition: "all 150ms ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {submitting ? "..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
