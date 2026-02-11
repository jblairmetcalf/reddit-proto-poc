"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  onUndo?: () => void;
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({ message, onUndo, onDismiss, duration = 5000 }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 200);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: `translateX(-50%) translateY(${visible ? "0" : "20px"})`,
        opacity: visible ? 1 : 0,
        transition: "all 200ms ease",
        zIndex: 10000,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "10px 16px",
          borderRadius: "10px",
          border: "1px solid var(--color-edge-strong, #3f3f46)",
          background: "var(--color-card, #18181b)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          fontSize: "13px",
          color: "var(--color-foreground, #fafafa)",
          whiteSpace: "nowrap",
        }}
      >
        <span>{message}</span>
        {onUndo && (
          <button
            onClick={() => {
              onUndo();
              setVisible(false);
              setTimeout(onDismiss, 200);
            }}
            style={{
              background: "none",
              border: "1px solid var(--color-edge-strong, #3f3f46)",
              borderRadius: "6px",
              padding: "4px 10px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#fb923c",
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
          >
            Undo
          </button>
        )}
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onDismiss, 200);
          }}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-muted, #71717a)",
            fontSize: "16px",
            cursor: "pointer",
            padding: "0 2px",
            lineHeight: 1,
          }}
        >
          &times;
        </button>
      </div>
    </div>
  );
}
