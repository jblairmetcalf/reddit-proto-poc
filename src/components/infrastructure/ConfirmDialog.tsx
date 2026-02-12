"use client";

import { useEffect, useState } from "react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "default";
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message,
  confirmLabel = "Delete",
  variant = "danger",
}: ConfirmDialogProps) {
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

  const handleAnimationEnd = () => {
    if (leaving) {
      setMounted(false);
      setLeaving(false);
    }
  };

  if (!mounted) return null;

  const confirmButtonClass =
    variant === "danger"
      ? "rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
      : "rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500";

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
          className="w-full max-w-sm rounded-xl border border-edge-strong bg-card p-6 shadow-2xl"
          style={{
            animation: `${leaving ? "dialog-panel-out" : "dialog-panel-in"} 150ms ease both`,
          }}
          tabIndex={-1}
          ref={(el) => el?.focus()}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "Enter") {
              onConfirm();
              onClose();
            }
          }}
        >
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="mt-2 text-sm text-secondary">{message}</p>
          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-edge-strong px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={confirmButtonClass}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
