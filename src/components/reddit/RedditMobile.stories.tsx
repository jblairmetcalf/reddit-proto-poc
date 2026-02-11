import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import RedditMobile from "./RedditMobile";

const meta = {
  title: "Reddit/RedditMobile",
  component: RedditMobile,
  parameters: {
    layout: "centered",
    backgrounds: { disable: true },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div
        style={{
          width: 390,
          height: 844,
          background: "var(--reddit-frame-bg, #000)",
          borderRadius: "var(--reddit-radius-device, 40px)",
          padding: 12,
          boxShadow: "var(--reddit-shadow-device, 0 20px 60px rgba(0,0,0,0.3), 0 0 0 8px #1a1a1a, 0 0 0 10px #2a2a2a)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dynamic Island */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "var(--reddit-notch-width, 150px)",
            height: "var(--reddit-notch-height, 28px)",
            background: "var(--reddit-frame-bg, #000)",
            borderRadius: "0 0 20px 20px",
            zIndex: 1000,
          }}
        />
        <Story />
      </div>
    ),
  ],
  args: {
    onTrack: fn(),
  },
} satisfies Meta<typeof RedditMobile>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default feed with built-in sample data. Navigate tabs to explore all views. */
export const DefaultFeed: Story = {
  args: {},
};

/** Feed with custom tech-focused posts and subreddits. */
export const TechFeed: Story = {
  args: {
    posts: [
      {
        id: 101,
        subreddit: "r/nextjs",
        author: "u/devOps99",
        time: "1h ago",
        title: "Next.js 16 is a game changer for server components",
        content: "The new streaming and partial prerendering features make building complex UIs so much easier.",
        upvotes: 3200,
        comments: 145,
        awards: 2,
        flair: "Discussion",
      },
      {
        id: 102,
        subreddit: "r/typescript",
        author: "u/typeNinja",
        time: "4h ago",
        title: "TypeScript 5.x: Template literal types are underrated",
        content: "Here are 5 patterns that will blow your mind with template literal types.",
        upvotes: 1800,
        comments: 89,
        awards: 3,
        flair: "Tutorial",
      },
      {
        id: 103,
        subreddit: "r/storybook",
        author: "u/componentDev",
        time: "6h ago",
        title: "Building a design system with Storybook 10",
        content: "Our team moved to Storybook 10 and the Vite integration is incredible. Here's our migration guide.",
        upvotes: 980,
        comments: 34,
        awards: 1,
        flair: "Guide",
      },
    ],
    subreddits: [
      { name: "r/nextjs", members: "89.2k", icon: "\u25B2", color: "#000000" },
      { name: "r/typescript", members: "234.5k", icon: "\uD83D\uDD37", color: "#3178C6" },
      { name: "r/storybook", members: "45.1k", icon: "\uD83D\uDCD5", color: "#FF4785" },
      { name: "r/reactjs", members: "412.8k", icon: "\u269B\uFE0F", color: "#61DAFB" },
      { name: "r/webdev", members: "2.1M", icon: "\uD83C\uDF10", color: "#FF4500" },
    ],
  },
};

/** Minimal feed with a single post for focused testing. */
export const SinglePost: Story = {
  args: {
    posts: [
      {
        id: 200,
        subreddit: "r/design",
        author: "u/uxResearcher",
        time: "30m ago",
        title: "What makes a good mobile navigation pattern?",
        content: "I've been studying mobile navigation patterns across apps and wanted to share some observations about tab bars, hamburger menus, and gesture-based navigation.",
        upvotes: 567,
        comments: 89,
        awards: 2,
        flair: "UX Research",
      },
    ],
    subreddits: [
      { name: "r/design", members: "1.8M", icon: "\uD83C\uDFA8", color: "#FF4500" },
    ],
  },
};

/** High-engagement feed with viral posts (high vote/comment counts). */
export const ViralFeed: Story = {
  args: {
    posts: [
      {
        id: 301,
        subreddit: "r/worldnews",
        author: "u/breakingReporter",
        time: "1h ago",
        title: "Major climate agreement reached at UN summit with 190 countries signing",
        content: "In a historic move, world leaders have agreed to unprecedented emissions targets that scientists say could limit warming to 1.5 degrees.",
        upvotes: 98400,
        comments: 12300,
        awards: 247,
        flair: "Breaking",
      },
      {
        id: 302,
        subreddit: "r/funny",
        author: "u/comedyKing",
        time: "3h ago",
        title: "My cat's reaction to the new robot vacuum",
        content: "I present to you: the most dramatic cat in existence.",
        upvotes: 67200,
        comments: 3450,
        awards: 89,
        image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%23FFB000"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="48" fill="white"%3E%F0%9F%90%B1%3C/text%3E%3C/svg%3E',
      },
      {
        id: 303,
        subreddit: "r/todayilearned",
        author: "u/factFinder88",
        time: "5h ago",
        title: "TIL that octopuses have three hearts and blue blood",
        content: "Two branchial hearts pump blood to the gills, while the systemic heart pumps it to the rest of the body. Their blood is copper-based rather than iron-based.",
        upvotes: 45100,
        comments: 2890,
        awards: 34,
        flair: "Biology",
      },
    ],
  },
};

/** Empty feed state — no posts or subreddits provided. */
export const EmptyFeed: Story = {
  args: {
    posts: [],
    subreddits: [],
  },
};
