"use client";

import React from "react";
import { ChevronUp, MessageCircle, Award, TrendingUp } from "lucide-react";
import type { PrototypeNotification } from "@/lib/types/prototype";

export interface NotificationItemProps {
  notification: PrototypeNotification;
  onClick?: (notification: PrototypeNotification) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
}) => {
  return (
    <div
      className={`reddit-notification ${notification.unread ? "unread" : ""}`}
      onClick={() => onClick?.(notification)}
    >
      <style>{`
        .reddit-notification {
          background: var(--reddit-bg-surface, #FFFFFF);
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 10px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border: 1px solid var(--reddit-border, #EDEFF1);
          position: relative;
          transition: all 150ms ease;
          cursor: pointer;
          font-family: var(--reddit-font-family, 'Reddit Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
        }
        .reddit-notification.unread {
          background: var(--reddit-notif-upvote-bg, #FFF4E6);
          border-color: var(--reddit-notif-upvote-border, #FFDFC4);
        }
        .reddit-notification:hover { background: var(--reddit-bg-elevated, #F6F7F8); }
        .reddit-notification .notif-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .reddit-notification .notif-icon.upvote {
          background: var(--reddit-notif-upvote-bg, #FFF4E6);
          color: var(--reddit-orange, #FF4500);
        }
        .reddit-notification .notif-icon.comment {
          background: var(--reddit-notif-comment-bg, #EBF0FF);
          color: var(--reddit-periwinkle, #7193FF);
        }
        .reddit-notification .notif-icon.award {
          background: var(--reddit-notif-award-bg, #FFFBEB);
          color: var(--reddit-gold, #FFD700);
        }
        .reddit-notification .notif-icon.trending {
          background: var(--reddit-notif-trending-bg, #ECFDF5);
          color: var(--reddit-green, #46D160);
        }
        .reddit-notification .notif-content { flex: 1; }
        .reddit-notification .notif-message {
          font-size: 0.875rem;
          color: var(--reddit-text-primary, #1A1A1B);
          margin-bottom: 4px;
        }
        .reddit-notification .notif-time {
          font-size: 0.75rem;
          color: var(--reddit-text-secondary, #7C7C7C);
        }
        .reddit-notification .unread-dot {
          width: 8px;
          height: 8px;
          background: var(--reddit-orange, #FF4500);
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 6px;
        }
      `}</style>

      <div className={`notif-icon ${notification.type}`}>
        {notification.type === "upvote" && <ChevronUp size={20} />}
        {notification.type === "comment" && <MessageCircle size={20} />}
        {notification.type === "award" && <Award size={20} />}
        {notification.type === "trending" && <TrendingUp size={20} />}
      </div>
      <div className="notif-content">
        <p className="notif-message">{notification.message}</p>
        <span className="notif-time">{notification.time}</span>
      </div>
      {notification.unread && <div className="unread-dot" />}
    </div>
  );
};

export default NotificationItem;
