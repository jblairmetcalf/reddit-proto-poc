import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import React from "react";
import { PostCard } from "./PostCard";
import { CommentThread } from "./CommentThread";
import { NotificationItem } from "./NotificationItem";
import { CommunityItem } from "./CommunityItem";
import { BottomNav } from "./BottomNav";
import { ProfileView } from "./ProfileView";

const meta = {
  title: "Reddit/Compositions",
  parameters: {
    layout: "centered",
    backgrounds: { disable: true },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 390, width: "100%" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** A complete feed view with multiple posts and bottom navigation. */
export const FeedView: Story = {
  render: () => (
    <div style={{ background: "var(--reddit-bg-canvas, #DAE0E6)", minHeight: 600, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <PostCard
          post={{
            id: 1,
            subreddit: "r/technology",
            author: "u/techEnthusiast",
            time: "3h ago",
            title: "New breakthrough in quantum computing shows promise",
            content: "Researchers at MIT have developed a new approach that could make quantum computers more practical.",
            upvotes: 12400,
            comments: 834,
            awards: 5,
            flair: "Research",
          }}
          onVote={fn()}
          onClick={fn()}
          onFlairClick={fn()}
          onShareClick={fn()}
        />
        <PostCard
          post={{
            id: 2,
            subreddit: "r/gaming",
            author: "u/pixelmaster",
            time: "5h ago",
            title: "After 300 hours, I finally completed every achievement in Elden Ring",
            content: "What a journey this has been. The hardest part was definitely Malenia!",
            upvotes: 8900,
            comments: 456,
            awards: 12,
            flair: "Achievement",
          }}
          onVote={fn()}
          onClick={fn()}
          onFlairClick={fn()}
          onShareClick={fn()}
        />
        <PostCard
          post={{
            id: 3,
            subreddit: "r/science",
            author: "u/labCoat42",
            time: "7h ago",
            title: "Sleep patterns and memory formation: a 5-year study",
            content: "A comprehensive study involving 10,000 participants has uncovered surprising insights.",
            upvotes: 15600,
            comments: 1203,
            awards: 8,
          }}
          onVote={fn()}
          onClick={fn()}
          onFlairClick={fn()}
          onShareClick={fn()}
        />
      </div>
      <BottomNav activeTab="home" onTabChange={fn()} />
    </div>
  ),
};

/** A post detail view with comments. */
export const PostDetailView: Story = {
  render: () => (
    <div style={{ background: "var(--reddit-bg-canvas, #DAE0E6)", minHeight: 600, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <PostCard
          post={{
            id: 1,
            subreddit: "r/technology",
            author: "u/techEnthusiast",
            time: "3h ago",
            title: "New breakthrough in quantum computing shows promise for real-world applications",
            content: "Researchers at MIT have developed a new approach that could make quantum computers more practical for everyday use.",
            upvotes: 12400,
            comments: 834,
            awards: 5,
            flair: "Research",
          }}
          onVote={fn()}
          onClick={fn()}
          onFlairClick={fn()}
          onShareClick={fn()}
        />
        <div style={{ padding: 16, background: "var(--reddit-bg-surface, #fff)" }}>
          <CommentThread
            comment={{
              id: 1,
              author: "u/quantum_physicist",
              time: "2h ago",
              content: "This is absolutely groundbreaking! The implications for cryptography alone are massive.",
              upvotes: 456,
              replies: [
                {
                  id: 11,
                  author: "u/cryptoExpert",
                  time: "1h ago",
                  content: "Agreed! This could completely change how we approach encryption.",
                  upvotes: 123,
                },
                {
                  id: 12,
                  author: "u/techEnthusiast",
                  time: "1h ago",
                  content: "Thanks for the support! The team is already working on practical applications.",
                  upvotes: 234,
                  isOP: true,
                },
              ],
            }}
            onVote={fn()}
            onShare={fn()}
          />
          <div style={{ borderTop: "1px solid var(--reddit-border, #EDEFF1)", marginTop: 16, paddingTop: 16 }}>
            <CommentThread
              comment={{
                id: 2,
                author: "u/industryInsider",
                time: "1h ago",
                content: "I work in the quantum computing industry and this is genuinely significant. The 40% error reduction is no joke.",
                upvotes: 567,
              }}
              onVote={fn()}
              onShare={fn()}
            />
          </div>
        </div>
      </div>
      <BottomNav activeTab="home" onTabChange={fn()} />
    </div>
  ),
};

/** Communities list view. */
export const CommunitiesView: Story = {
  render: () => (
    <div style={{ background: "var(--reddit-bg-canvas, #DAE0E6)", minHeight: 600, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--reddit-text-primary, #1A1A1B)", padding: "8px 4px", fontFamily: "var(--reddit-font-family)" }}>Your Communities</h2>
        {[
          { name: "r/technology", members: "14.2M", icon: "\uD83D\uDCBB", color: "#FF4500" },
          { name: "r/gaming", members: "37.8M", icon: "\uD83C\uDFAE", color: "#0079D3" },
          { name: "r/science", members: "30.1M", icon: "\uD83D\uDD2C", color: "#46D160" },
          { name: "r/art", members: "25.7M", icon: "\uD83C\uDFA8", color: "#FFB000" },
          { name: "r/music", members: "32.3M", icon: "\uD83C\uDFB5", color: "#7193FF" },
        ].map((community, i) => (
          <CommunityItem
            key={community.name}
            community={community}
            onClick={fn()}
            animationDelay={`${i * 0.05}s`}
          />
        ))}
      </div>
      <BottomNav activeTab="communities" onTabChange={fn()} />
    </div>
  ),
};

/** Inbox view with notifications. */
export const InboxView: Story = {
  render: () => (
    <div style={{ background: "var(--reddit-bg-canvas, #DAE0E6)", minHeight: 600, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--reddit-text-primary, #1A1A1B)", padding: "8px 4px", fontFamily: "var(--reddit-font-family)" }}>Inbox</h2>
        <NotificationItem
          notification={{ id: 1, type: "upvote", message: "u/randomUser upvoted your post in r/technology", time: "2h ago", unread: true }}
          onClick={fn()}
        />
        <NotificationItem
          notification={{ id: 2, type: "comment", message: "u/commenter123 replied to your comment in r/gaming", time: "5h ago", unread: true }}
          onClick={fn()}
        />
        <NotificationItem
          notification={{ id: 3, type: "award", message: "Your post received a Gold Award!", time: "1d ago", unread: false }}
          onClick={fn()}
        />
        <NotificationItem
          notification={{ id: 4, type: "trending", message: "Your post is trending in r/science", time: "2d ago", unread: false }}
          onClick={fn()}
        />
      </div>
      <BottomNav activeTab="notifications" onTabChange={fn()} />
    </div>
  ),
};

/** Profile view with bottom navigation. */
export const ProfilePageView: Story = {
  render: () => (
    <div style={{ background: "var(--reddit-bg-canvas, #DAE0E6)", minHeight: 600, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1 }}>
        <ProfileView
          username="u/BlairMetcalf"
          karma="125.3k"
          accountAge="8y"
          postCount={892}
          commentCount="12.4k"
          awardCount={156}
          onSavedPosts={fn()}
          onHistory={fn()}
          onAchievements={fn()}
        />
      </div>
      <BottomNav activeTab="profile" onTabChange={fn()} />
    </div>
  ),
};

/** Upvoted and downvoted post states side by side. */
export const VoteStates: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <PostCard
        post={{ id: 1, subreddit: "r/science", author: "u/labCoat42", time: "7h", title: "Upvoted post example", content: "This post has been upvoted.", upvotes: 15600, comments: 1203, awards: 8 }}
        votedPosts={{ 1: "up" }}
        onVote={fn()}
        onClick={fn()}
        onFlairClick={fn()}
        onShareClick={fn()}
      />
      <PostCard
        post={{ id: 2, subreddit: "r/movies", author: "u/cinephile", time: "9h", title: "Downvoted post example", content: "This post has been downvoted.", upvotes: 6700, comments: 289, awards: 0 }}
        votedPosts={{ 2: "down" }}
        onVote={fn()}
        onClick={fn()}
        onFlairClick={fn()}
        onShareClick={fn()}
      />
      <PostCard
        post={{ id: 3, subreddit: "r/gaming", author: "u/gamer", time: "2h", title: "Neutral vote state", content: "This post has no vote.", upvotes: 4200, comments: 156, awards: 3, flair: "Discussion" }}
        onVote={fn()}
        onClick={fn()}
        onFlairClick={fn()}
        onShareClick={fn()}
      />
    </div>
  ),
};
