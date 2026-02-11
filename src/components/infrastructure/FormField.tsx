import { type ReactNode } from "react";

interface FormFieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

export const INPUT_CLASSES =
  "w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none";

export const TEXTAREA_CLASSES =
  "w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none resize-none";

export const SELECT_CLASSES =
  "w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground focus:border-orange-500 focus:outline-none";

export default function FormField({ label, hint, children }: FormFieldProps) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-secondary">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
    </div>
  );
}
