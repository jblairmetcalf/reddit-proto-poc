"use client";

import React from "react";
import { User, ChevronUp, Bookmark, Eye, Award } from "lucide-react";

export interface ProfileViewProps {
  username?: string;
  karma?: string;
  accountAge?: string;
  postCount?: number;
  commentCount?: string;
  awardCount?: number;
  onSavedPosts?: () => void;
  onHistory?: () => void;
  onAchievements?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  username = "u/YourUsername",
  karma = "42.5k",
  accountAge = "3y",
  postCount = 156,
  commentCount = "2.4k",
  awardCount = 28,
  onSavedPosts,
  onHistory,
  onAchievements,
}) => {
  return (
    <div className="reddit-profile">
      <style>{`
        .reddit-profile {
          padding: 20px 16px;
          animation: profileFadeIn 300ms ease;
          font-family: var(--reddit-font-family, 'Reddit Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
        }
        @keyframes profileFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reddit-profile .profile-header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid var(--reddit-border, #EDEFF1);
          margin-bottom: 20px;
        }
        .reddit-profile .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--reddit-orange, #FF4500);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          color: white;
          border: 3px solid var(--reddit-border, #EDEFF1);
        }
        .reddit-profile .profile-name {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--reddit-text-primary, #1A1A1B);
        }
        .reddit-profile .profile-karma {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--reddit-text-secondary, #7C7C7C);
          font-size: 0.8125rem;
        }
        .reddit-profile .karma-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .reddit-profile .karma-divider { color: var(--reddit-border, #EDEFF1); }
        .reddit-profile .profile-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }
        .reddit-profile .stat-item {
          background: var(--reddit-bg-surface, #FFFFFF);
          padding: 16px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid var(--reddit-border, #EDEFF1);
          transition: all 150ms ease;
        }
        .reddit-profile .stat-item:hover {
          background: var(--reddit-bg-elevated, #F6F7F8);
          border-color: var(--reddit-orange, #FF4500);
        }
        .reddit-profile .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--reddit-orange, #FF4500);
          margin-bottom: 4px;
        }
        .reddit-profile .stat-label {
          font-size: 0.75rem;
          color: var(--reddit-text-secondary, #7C7C7C);
          font-weight: 600;
        }
        .reddit-profile .profile-sections {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .reddit-profile .profile-section-btn {
          background: var(--reddit-bg-surface, #FFFFFF);
          border: 1px solid var(--reddit-border, #EDEFF1);
          color: var(--reddit-text-primary, #1A1A1B);
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 150ms ease;
        }
        .reddit-profile .profile-section-btn:hover {
          background: var(--reddit-bg-elevated, #F6F7F8);
          border-color: var(--reddit-orange, #FF4500);
        }
      `}</style>

      <div className="profile-header">
        <div className="profile-avatar">
          <User size={48} />
        </div>
        <h2 className="profile-name">{username}</h2>
        <p className="profile-karma">
          <span className="karma-item">
            <ChevronUp size={16} />
            {karma} karma
          </span>
          <span className="karma-divider">&bull;</span>
          <span className="karma-item">{accountAge} on Reddit</span>
        </p>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <div className="stat-value">{postCount}</div>
          <div className="stat-label">Posts</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{commentCount}</div>
          <div className="stat-label">Comments</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{awardCount}</div>
          <div className="stat-label">Awards</div>
        </div>
      </div>

      <div className="profile-sections">
        <button className="profile-section-btn" onClick={onSavedPosts}>
          <Bookmark size={20} />
          <span>Saved Posts</span>
        </button>
        <button className="profile-section-btn" onClick={onHistory}>
          <Eye size={20} />
          <span>History</span>
        </button>
        <button className="profile-section-btn" onClick={onAchievements}>
          <Award size={20} />
          <span>Achievements</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
