"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  maxWidth?: "sm" | "md" | "lg";
  children: ReactNode;
  footer?: ReactNode;
  onSubmit?: () => void;
}

const MAX_WIDTH_MAP = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

export default function Dialog({
  open,
  onClose,
  title,
  maxWidth = "md",
  children,
  footer,
  onSubmit,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setLeaving(false);
    } else if (mounted) {
      setLeaving(true);
    }
  }, [open, mounted]);

  useEffect(() => {
    if (open && mounted) {
      const el = panelRef.current;
      if (el) {
        const autofocus = el.querySelector<HTMLElement>("[autofocus]");
        if (autofocus) autofocus.focus();
      }
    }
  }, [open, mounted]);

  const handleAnimationEnd = () => {
    if (leaving) {
      setMounted(false);
      setLeaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <>
      <style>{`
        @keyframes dialog-overlay-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dialog-overlay-out { from { opacity: 1; } to { opacity: 0; } }
        @keyframes dialog-panel-in { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes dialog-panel-out { from { opacity: 1; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(0.95) translateY(8px); } }
      `}</style>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-overlay"
        style={{
          animation: `${leaving ? "dialog-overlay-out" : "dialog-overlay-in"} 150ms ease both`,
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        onAnimationEnd={handleAnimationEnd}
      >
        <div
          ref={panelRef}
          className={`w-full ${MAX_WIDTH_MAP[maxWidth]} rounded-xl border border-edge-strong bg-card p-6 shadow-2xl`}
          style={{
            animation: `${leaving ? "dialog-panel-out" : "dialog-panel-in"} 150ms ease both`,
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (
              e.key === "Enter" &&
              onSubmit &&
              e.target instanceof HTMLElement &&
              e.target.tagName !== "TEXTAREA"
            ) {
              e.preventDefault();
              onSubmit();
            }
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:text-foreground"
            >
              &times;
            </button>
          </div>
          {children}
          {footer}
        </div>
      </div>
    </>
  );
}
