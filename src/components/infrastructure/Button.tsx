import { type ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md";
  dangerHover?: boolean;
}

const base =
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

const variants = {
  primary: "bg-orange-600 text-white hover:bg-orange-500",
  secondary:
    "border border-edge-strong text-secondary hover:text-foreground",
  danger: "bg-red-600 text-white hover:bg-red-500",
  ghost: "text-muted hover:text-foreground",
  outline:
    "border border-edge-strong text-secondary hover:border-orange-500 hover:text-orange-400",
};

export default function Button({
  variant = "primary",
  size = "md",
  dangerHover = false,
  className = "",
  ...props
}: ButtonProps) {
  const dangerClasses =
    dangerHover && variant === "ghost"
      ? "hover:bg-red-500/10 hover:text-red-400"
      : "";

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${dangerClasses} ${className}`.trim()}
      {...props}
    />
  );
}
