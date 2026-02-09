"use client";

import React from "react";
import {
  MessageCircle,
  Share2,
  MoreHorizontal,
  ChevronUp,
  Award,
} from "lucide-react";
import type { PrototypePost, VoteState } from "@/lib/types/prototype";

export interface PostCardProps {
  post: PrototypePost;
  votedPosts?: VoteState;
  onVote?: (postId: number | string, voteType: "up" | "down") => void;
  onClick?: (post: PrototypePost) => void;
  onFlairClick?: (flair: string) => void;
  onShareClick?: (postId: number | string) => void;
}

function formatNumber(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  votedPosts = {},
  onVote,
  onClick,
  onFlairClick,
  onShareClick,
}) => {
  const voteState = votedPosts[post.id];
  const displayVotes =
    post.upvotes + (voteState === "up" ? 1 : voteState === "down" ? -1 : 0);

  return (
    <div className="reddit-post-card" onClick={() => onClick?.(post)}>
      <style>{`
        .reddit-post-card {
          background: var(--reddit-bg-surface, #FFFFFF);
          border-bottom: 1px solid var(--reddit-border, #EDEFF1);
          padding: 8px 16px;
          cursor: pointer;
          transition: background var(--reddit-transition, 150ms ease);
          font-family: var(--reddit-font-family, 'Reddit Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
        }
        .reddit-post-card:hover { background: var(--reddit-bg-elevated, #F6F7F8); }
        .reddit-post-card .post-header {
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .reddit-post-card .post-meta {
          font-size: 0.75rem;
          color: var(--reddit-text-secondary, #7C7C7C);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .reddit-post-card .subreddit-name {
          color: var(--reddit-text-primary, #1A1A1B);
          font-weight: 700;
        }
        .reddit-post-card .post-content { margin-bottom: 6px; }
        .reddit-post-card .post-title {
          font-size: 1rem;
          line-height: 1.5rem;
          font-weight: 600;
          margin-bottom: 4px;
          color: var(--reddit-text-primary, #1A1A1B);
        }
        .reddit-post-card .post-text {
          font-size: 0.875rem;
          line-height: 1.375rem;
          color: var(--reddit-text-primary, #1A1A1B);
          margin-bottom: 6px;
        }
        .reddit-post-card .post-image-container {
          border-radius: 8px;
          overflow: hidden;
          margin-top: 6px;
          border: 1px solid var(--reddit-border, #EDEFF1);
        }
        .reddit-post-card .post-image { width: 100%; height: auto; display: block; }
        .reddit-post-card .post-flair {
          display: inline-block;
          background: transparent;
          color: var(--reddit-text-secondary, #7C7C7C);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          margin-top: 8px;
          border: 1px solid var(--reddit-border-strong, #CCCCCC);
          cursor: pointer;
          transition: all var(--reddit-transition, 150ms ease);
        }
        .reddit-post-card .post-flair:hover {
          background: var(--reddit-bg-elevated, #F6F7F8);
          border-color: #999999;
        }
        .reddit-post-card .post-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          padding-top: 4px;
        }
        .reddit-post-card .vote-section {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 8px;
          border-radius: 16px;
        }
        .reddit-post-card .vote-btn {
          background: none;
          border: none;
          color: var(--reddit-text-secondary, #7C7C7C);
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all var(--reddit-transition, 150ms ease);
          padding: 4px;
        }
        .reddit-post-card .vote-btn.down { transform: rotate(180deg); }
        .reddit-post-card .vote-btn.voted-up { color: var(--reddit-orange, #FF4500); }
        .reddit-post-card .vote-btn.voted-down { color: var(--reddit-periwinkle, #7193FF); }
        .reddit-post-card .vote-btn:hover { transform: scale(1.2); }
        .reddit-post-card .vote-btn.down:hover { transform: rotate(180deg) scale(1.2); }
        .reddit-post-card .vote-count {
          font-weight: 700;
          font-size: 0.8125rem;
          color: var(--reddit-text-primary, #1A1A1B);
          min-width: 35px;
          text-align: center;
        }
        .reddit-post-card .vote-count.voted-up { color: var(--reddit-orange, #FF4500); }
        .reddit-post-card .vote-count.voted-down { color: var(--reddit-periwinkle, #7193FF); }
        .reddit-post-card .action-btn {
          background: none;
          border: none;
          color: var(--reddit-text-secondary, #7C7C7C);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 6px 8px;
          border-radius: 8px;
          transition: all var(--reddit-transition, 150ms ease);
        }
        .reddit-post-card .action-btn:hover {
          background: var(--reddit-bg-elevated, #F6F7F8);
          color: var(--reddit-text-primary, #1A1A1B);
        }
        .reddit-post-card .action-btn.more { padding: 6px; }
      `}</style>

      <div className="post-header">
        <div className="post-meta">
          <span className="subreddit-name">{post.subreddit}</span>
          <span>&bull; {post.time.replace(" ago", "")}</span>
        </div>
        <button
          className="action-btn more"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-text">{post.content}</p>
        {post.image && (
          <div className="post-image-container">
            <img src={post.image} alt="Post content" className="post-image" />
          </div>
        )}
        {post.flair && (
          <span
            className="post-flair"
            onClick={(e) => {
              e.stopPropagation();
              onFlairClick?.(post.flair!);
            }}
          >
            {post.flair}
          </span>
        )}
      </div>

      <div className="post-actions" onClick={(e) => e.stopPropagation()}>
        <div className="vote-section">
          <button
            className={`vote-btn ${voteState === "up" ? "voted-up" : ""}`}
            onClick={() => onVote?.(post.id, "up")}
          >
            <ChevronUp size={20} />
          </button>
          <span
            className={`vote-count ${voteState === "up" ? "voted-up" : voteState === "down" ? "voted-down" : ""}`}
          >
            {formatNumber(displayVotes)}
          </span>
          <button
            className={`vote-btn down ${voteState === "down" ? "voted-down" : ""}`}
            onClick={() => onVote?.(post.id, "down")}
          >
            <ChevronUp size={20} />
          </button>
        </div>

        <button className="action-btn">
          <MessageCircle size={18} />
          <span>{formatNumber(post.comments)}</span>
        </button>

        <button
          className="action-btn"
          onClick={() => onShareClick?.(post.id)}
        >
          <Share2 size={18} />
        </button>

        {post.awards > 0 && (
          <button className="action-btn">
            <Award size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default PostCard;
