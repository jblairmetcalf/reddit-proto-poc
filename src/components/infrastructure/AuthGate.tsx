"use client";

import { useState, useEffect, type ReactNode } from "react";

const PASSWORD = "uipux";
const AUTH_KEY = "reddit-proto-auth";
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

function isAuthValid(): boolean {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (!stored) return false;
    const expiry = Number(stored);
    if (isNaN(expiry)) return false;
    return Date.now() < expiry;
  } catch {
    return false;
  }
}

export default function AuthGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isAuthValid()) {
      setAuthed(true);
    }
  }, []);

  if (!mounted) return null;

  if (authed) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PASSWORD) {
      localStorage.setItem(AUTH_KEY, String(Date.now() + TWENTY_FOUR_HOURS));
      setAuthed(true);
    } else {
      setError(true);
      setInput("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit}
        className="flex w-80 flex-col gap-4 rounded-xl bg-card p-8"
      >
        <h1 className="text-xl font-bold text-foreground">Reddit Proto</h1>
        <p className="text-sm text-secondary">Enter password to continue</p>
        <input
          type="password"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(false);
          }}
          placeholder="Password"
          autoFocus
          className="rounded-lg border border-edge-strong bg-input px-4 py-2 text-foreground placeholder:text-muted focus:border-orange-500 focus:outline-none"
        />
        {error && (
          <p className="text-sm text-red-400">Incorrect password</p>
        )}
        <button
          type="submit"
          className="rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-500 transition-colors"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
