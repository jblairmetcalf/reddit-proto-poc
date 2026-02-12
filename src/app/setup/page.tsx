"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const STUDIES = [
  {
    name: "Compact Feed & Hidden Votes Study",
    description:
      "Testing whether compact feed density and hidden vote counts change engagement patterns and reduce bias in voting behavior.",
    prototypeVariant: "variant-a",
  },
  {
    name: "Minimal Chrome Study",
    description:
      "Testing whether removing awards and using chronological sort leads to more content-focused browsing and longer session times.",
    prototypeVariant: "variant-b",
  },
];

const PARTICIPANT_SETS = [
  [
    { name: "Alex Rivera", email: "alex.rivera@synthetic.test", persona: "Power User", userType: "Daily active" },
    { name: "Sam Chen", email: "sam.chen@synthetic.test", persona: "Lurker", userType: "Read-only browser" },
    { name: "Jordan Taylor", email: "jordan.taylor@synthetic.test", persona: "Commenter", userType: "Discussion-focused" },
  ],
  [
    { name: "Morgan Kim", email: "morgan.kim@synthetic.test", persona: "New User", userType: "First-week onboarding" },
    { name: "Casey Patel", email: "casey.patel@synthetic.test", persona: "Content Creator", userType: "Posts frequently" },
    { name: "Riley Brooks", email: "riley.brooks@synthetic.test", persona: "Casual Browser", userType: "Weekly visitor" },
  ],
];

interface LogEntry {
  message: string;
  type: "info" | "success" | "error";
}

export default function SetupPage() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  function log(message: string, type: LogEntry["type"] = "info") {
    setLogs((prev) => [...prev, { message, type }]);
  }

  async function runSetup() {
    setRunning(true);
    setLogs([]);

    try {
      log("=== UXR Agent: Creating Studies ===");

      const studyIds: { id: string; name: string; variant: string }[] = [];

      for (const study of STUDIES) {
        const docRef = await addDoc(collection(db, "studies"), {
          name: study.name,
          description: study.description,
          status: "active",
          prototypeVariant: study.prototypeVariant,
          createdAt: Timestamp.now(),
        });
        studyIds.push({ id: docRef.id, name: study.name, variant: study.prototypeVariant });
        log(`Study created: "${study.name}" (${study.prototypeVariant}) → ${docRef.id}`, "success");
      }

      log("");
      log("=== Inviting Synthetic Participants ===");

      for (let si = 0; si < studyIds.length; si++) {
        const study = studyIds[si];
        const participants = PARTICIPANT_SETS[si];

        for (const p of participants) {
          const participantId = `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

          // Create JWT token
          const tokenRes = await fetch("/api/auth/participant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              participantId,
              studyId: study.id,
              name: p.name,
              prototypeVariant: study.variant,
            }),
          });
          const tokenData = await tokenRes.json();

          // Store in Firestore
          await addDoc(collection(db, "participants"), {
            name: p.name,
            email: p.email,
            persona: p.persona,
            userType: p.userType,
            studyId: study.id,
            studyStatus: { [study.id]: "invited" },
            tokenUrls: { [study.id]: tokenData.url },
            createdAt: Timestamp.now(),
          });

          log(`  Invited ${p.name} (${p.persona}) → ${study.name}`, "success");
        }
      }

      log("");
      log("=== Setup Complete ===", "success");
      log(`Created ${studyIds.length} studies with ${PARTICIPANT_SETS.flat().length} total participants.`, "success");
      setDone(true);
    } catch (err) {
      log(`Error: ${err}`, "error");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Study Setup</h1>
        <p className="mt-1 text-sm text-secondary">
          Creates 2 studies (variant-a, variant-b) with 3 synthetic participants each.
        </p>
      </header>

      {!done && (
        <button
          onClick={runSetup}
          disabled={running}
          className="mb-6 rounded-lg bg-orange-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
        >
          {running ? "Running..." : "Run Setup"}
        </button>
      )}

      {logs.length > 0 && (
        <div className="rounded-xl border border-edge bg-card p-5">
          <pre className="space-y-0.5 text-xs">
            {logs.map((entry, i) => (
              <div
                key={i}
                className={
                  entry.type === "success"
                    ? "text-emerald-400"
                    : entry.type === "error"
                      ? "text-red-400"
                      : "text-secondary"
                }
              >
                {entry.message}
              </div>
            ))}
          </pre>
        </div>
      )}

      {done && (
        <div className="mt-4 flex gap-3">
          <a
            href="/user-research/studies"
            className="rounded-lg border border-edge-strong px-4 py-2 text-sm font-medium text-secondary hover:border-orange-500 hover:text-orange-400"
          >
            View Studies
          </a>
          <a
            href="/user-research/participants"
            className="rounded-lg border border-edge-strong px-4 py-2 text-sm font-medium text-secondary hover:border-orange-500 hover:text-orange-400"
          >
            View Participants
          </a>
        </div>
      )}
    </div>
  );
}
