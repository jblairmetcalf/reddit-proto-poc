"use client";

import React from "react";
import { ChevronUp, MessageCircle, Share2 } from "lucide-react";
import type { PrototypeComment, VoteState } from "@/lib/types/prototype";

export interface CommentThreadProps {
  comment: PrototypeComment;
  isReply?: boolean;
  votedComments?: VoteState;
  onVote?: (commentId: number | string, voteType: "up" | "down") => void;
  onShare?: (commentId: number | string) => void;
}

function formatNumber(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comment,
  isReply = false,
  votedComments = {},
  onVote,
  onShare,
}) => {
  const voteState = votedComments[comment.id];
  const displayVotes =
    comment.upvotes +
    (voteState === "up" ? 1 : voteState === "down" ? -1 : 0);

  return (
    <div className={`reddit-comment ${isReply ? "is-reply" : ""}`}>
      <style>{`
        .reddit-comment {
          display: flex;
          gap: 8px;
          font-family: var(--reddit-font-family, 'Reddit Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif);
        }
        .reddit-comment.is-reply { margin-left: 32px; }
        .reddit-comment .comment-vote {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 4px;
          gap: 4px;
        }
        .reddit-comment .vote-btn {
          background: none;
          border: none;
          color: var(--reddit-text-secondary, #7C7C7C);
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 150ms ease;
          padding: 4px;
        }
        .reddit-comment .vote-btn.down { transform: rotate(180deg); }
        .reddit-comment .vote-btn.voted-up { color: var(--reddit-orange, #FF4500); }
        .reddit-comment .vote-btn.voted-down { color: var(--reddit-periwinkle, #7193FF); }
        .reddit-comment .vote-line {
          width: 2px;
          flex: 1;
          background: var(--reddit-border, #EDEFF1);
          min-height: 20px;
        }
        .reddit-comment .comment-body { flex: 1; }
        .reddit-comment .comment-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }
        .reddit-comment .comment-author {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--reddit-text-primary, #1A1A1B);
        }
        .reddit-comment .op-badge {
          background: var(--reddit-orange, #FF4500);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .reddit-comment .comment-time {
          font-size: 0.75rem;
          color: var(--reddit-text-secondary, #7C7C7C);
        }
        .reddit-comment .comment-text {
          font-size: 0.875rem;
          line-height: 1.375rem;
          color: var(--reddit-text-primary, #1A1A1B);
          margin-bottom: 8px;
        }
        .reddit-comment .comment-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .reddit-comment .comment-score {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--reddit-text-secondary, #7C7C7C);
        }
        .reddit-comment .comment-score.voted-up { color: var(--reddit-orange, #FF4500); }
        .reddit-comment .comment-score.voted-down { color: var(--reddit-periwinkle, #7193FF); }
        .reddit-comment .comment-action-btn {
          background: none;
          border: none;
          color: var(--reddit-text-secondary, #7C7C7C);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 8px;
          transition: all 150ms ease;
        }
        .reddit-comment .comment-action-btn:hover {
          background: var(--reddit-bg-elevated, #F6F7F8);
          color: var(--reddit-text-primary, #1A1A1B);
        }
        .reddit-comment .replies {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
      `}</style>

      <div className="comment-vote">
        <button
          className={`vote-btn ${voteState === "up" ? "voted-up" : ""}`}
          onClick={() => onVote?.(comment.id, "up")}
        >
          <ChevronUp size={16} />
        </button>
        <div className="vote-line" />
        <button
          className={`vote-btn down ${voteState === "down" ? "voted-down" : ""}`}
          onClick={() => onVote?.(comment.id, "down")}
        >
          <ChevronUp size={16} />
        </button>
      </div>
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-author">{comment.author}</span>
          {comment.isOP && <span className="op-badge">OP</span>}
          <span className="comment-time">&bull; {comment.time}</span>
        </div>
        <p className="comment-text">{comment.content}</p>
        <div className="comment-actions">
          <span
            className={`comment-score ${voteState === "up" ? "voted-up" : voteState === "down" ? "voted-down" : ""}`}
          >
            {formatNumber(displayVotes)} points
          </span>
          <button className="comment-action-btn">
            <MessageCircle size={14} />
            Reply
          </button>
          <button
            className="comment-action-btn"
            onClick={() => onShare?.(comment.id)}
          >
            <Share2 size={14} />
            Share
          </button>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="replies">
            {comment.replies.map((reply) => (
              <CommentThread
                key={reply.id}
                comment={reply}
                isReply
                votedComments={votedComments}
                onVote={onVote}
                onShare={onShare}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentThread;
