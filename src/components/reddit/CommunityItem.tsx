"use client";

import React from "react";
import { ChevronUp } from "lucide-react";
import type { PrototypeSubreddit } from "@/lib/types/prototype";

export interface CommunityItemProps {
  community: PrototypeSubreddit;
  onClick?: (community: PrototypeSubreddit) => void;
  showChevron?: boolean;
  showJoinButton?: boolean;
  animationDelay?: string;
}

export const CommunityItem: React.FC<CommunityItemProps> = ({
  community,
  onClick,
  showChevron = true,
  showJoinButton = false,
  animationDelay = "0s",
}) => {
  return (
    <div
      className="reddit-community-item"
      style={{ animationDelay }}
      onClick={() => onClick?.(community)}
    >
      <style>{`
        .reddit-community-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--reddit-bg-surface, #FFFFFF);
          border: 1px solid var(--reddit-border, #EDEFF1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 150ms ease;
          animation: communitySlideIn 300ms ease both;
          font-family: var(--reddit-font-family, 'Reddit Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
        }
        @keyframes communitySlideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .reddit-community-item:hover {
          background: var(--reddit-bg-elevated, #F6F7F8);
          border-color: var(--reddit-orange, #FF4500);
        }
        .reddit-community-item .community-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }
        .reddit-community-item .community-info { flex: 1; }
        .reddit-community-item .community-name {
          font-weight: 700;
          font-size: 0.875rem;
          color: var(--reddit-text-primary, #1A1A1B);
          margin-bottom: 2px;
        }
        .reddit-community-item .community-members {
          font-size: 0.75rem;
          color: var(--reddit-text-secondary, #7C7C7C);
        }
        .reddit-community-item .join-btn {
          background: var(--reddit-orange, #FF4500);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 150ms ease;
        }
        .reddit-community-item .join-btn:hover { background: var(--reddit-orange-hover, #FF5722); }
        .reddit-community-item .chevron-btn {
          background: none;
          border: none;
          color: var(--reddit-text-secondary, #7C7C7C);
          padding: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 150ms ease;
        }
        .reddit-community-item .chevron-btn:hover { color: var(--reddit-text-primary, #1A1A1B); }
      `}</style>

      <div
        className="community-icon"
        style={{ backgroundColor: community.color }}
      >
        <span>{community.icon}</span>
      </div>
      <div className="community-info">
        <div className="community-name">{community.name}</div>
        <div className="community-members">{community.members} members</div>
      </div>
      {showJoinButton && (
        <button className="join-btn" onClick={(e) => e.stopPropagation()}>
          Join
        </button>
      )}
      {showChevron && (
        <button className="chevron-btn">
          <ChevronUp size={18} style={{ transform: "rotate(90deg)" }} />
        </button>
      )}
    </div>
  );
};

export default CommunityItem;
