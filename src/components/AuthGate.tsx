"use client";

import { useState, useEffect, type ReactNode } from "react";

const PASSWORD = "uipux";

export default function AuthGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem("reddit-proto-auth") === "true") {
      setAuthed(true);
    }
  }, []);

  if (!mounted) return null;

  if (authed) return <>{children}</>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === PASSWORD) {
      sessionStorage.setItem("reddit-proto-auth", "true");
      setAuthed(true);
    } else {
      setError(true);
      setInput("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <form
        onSubmit={handleSubmit}
        className="flex w-80 flex-col gap-4 rounded-xl bg-zinc-900 p-8"
      >
        <h1 className="text-xl font-bold text-white">Reddit Proto</h1>
        <p className="text-sm text-zinc-400">Enter password to continue</p>
        <input
          type="password"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(false);
          }}
          placeholder="Password"
          autoFocus
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none"
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
