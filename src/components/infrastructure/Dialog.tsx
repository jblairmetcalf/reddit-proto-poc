"use client";

import { type ReactNode, useEffect, useRef } from "react";

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

  useEffect(() => {
    if (open) {
      // Focus first autofocus element or the panel itself
      const el = panelRef.current;
      if (el) {
        const autofocus = el.querySelector<HTMLElement>("[autofocus]");
        if (autofocus) {
          autofocus.focus();
        }
      }
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className={`w-full ${MAX_WIDTH_MAP[maxWidth]} rounded-xl border border-edge-strong bg-card p-6 shadow-2xl`}
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
  );
}
