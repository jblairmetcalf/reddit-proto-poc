"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const tabs = [
  { hash: "#home", label: "Home" },
  { hash: "#notifications", label: "Notifications" },
  { hash: "#profile", label: "Profile" },
] as const;

type Tab = (typeof tabs)[number]["hash"];

function HomeView() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white">Home Feed</h2>
      <p className="mt-2 text-zinc-400">Prototype home feed content goes here.</p>
    </div>
  );
}

function NotificationsView() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white">Notifications</h2>
      <p className="mt-2 text-zinc-400">Notification items will appear here.</p>
    </div>
  );
}

function ProfileView() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-white">Profile</h2>
      <p className="mt-2 text-zinc-400">User profile content goes here.</p>
    </div>
  );
}

export default function PrototypePage() {
  const [activeTab, setActiveTab] = useState<Tab>("#home");

  useEffect(() => {
    const hash = window.location.hash as Tab;
    if (tabs.some((t) => t.hash === hash)) {
      setActiveTab(hash);
    } else {
      window.location.hash = "#home";
    }

    const onHashChange = () => {
      const h = window.location.hash as Tab;
      if (tabs.some((t) => t.hash === h)) {
        setActiveTab(h);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (hash: Tab) => {
    window.location.hash = hash;
    setActiveTab(hash);
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <header className="flex items-center gap-4 border-b border-zinc-800 px-6 py-4">
        <Link
          href="/"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          &larr; Dashboard
        </Link>
        <h1 className="text-lg font-bold text-white">Prototype</h1>
      </header>

      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-6">
          {activeTab === "#home" && <HomeView />}
          {activeTab === "#notifications" && <NotificationsView />}
          {activeTab === "#profile" && <ProfileView />}
        </main>

        <nav className="sticky bottom-0 flex border-t border-zinc-800 bg-zinc-900">
          {tabs.map((tab) => (
            <button
              key={tab.hash}
              onClick={() => navigate(tab.hash)}
              className={`flex-1 py-4 text-center text-sm font-medium transition-colors ${
                activeTab === tab.hash
                  ? "text-orange-400 border-t-2 border-orange-400 -mt-px"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
