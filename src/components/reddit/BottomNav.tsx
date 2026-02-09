"use client";

import React from "react";
import { Home, Menu, Bell, User } from "lucide-react";

export type NavTab = "home" | "communities" | "notifications" | "profile";

export interface BottomNavProps {
  activeTab: NavTab;
  onTabChange?: (tab: NavTab) => void;
}

const tabs: { id: NavTab; label: string; Icon: React.FC<{ size: number }> }[] = [
  { id: "home", label: "Home", Icon: Home },
  { id: "communities", label: "Communities", Icon: Menu },
  { id: "notifications", label: "Inbox", Icon: Bell },
  { id: "profile", label: "Profile", Icon: User },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="reddit-bottom-nav">
      <style>{`
        .reddit-bottom-nav {
          background: var(--reddit-bg-surface, #FFFFFF);
          border-top: 1px solid var(--reddit-border, #EDEFF1);
          padding: 8px 0 12px 0;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          font-family: var(--reddit-font-family, 'Reddit Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
        }
        .reddit-bottom-nav .nav-item {
          background: none;
          border: none;
          color: var(--reddit-text-secondary, #7C7C7C);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          transition: all 150ms ease;
          position: relative;
        }
        .reddit-bottom-nav .nav-item:hover { color: var(--reddit-text-primary, #1A1A1B); }
        .reddit-bottom-nav .nav-item.active { color: var(--reddit-orange, #FF4500); }
        .reddit-bottom-nav .nav-item.active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 32px;
          height: 3px;
          background: var(--reddit-orange, #FF4500);
          border-radius: 0 0 3px 3px;
        }
        .reddit-bottom-nav .nav-label {
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
        }
      `}</style>

      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onTabChange?.(tab.id)}
        >
          <tab.Icon size={24} />
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNav;
