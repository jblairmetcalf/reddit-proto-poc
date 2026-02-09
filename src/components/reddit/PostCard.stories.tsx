import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { PostCard } from "./PostCard";

const meta = {
  title: "Reddit/PostCard",
  component: PostCard,
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
  args: {
    onVote: fn(),
    onClick: fn(),
    onFlairClick: fn(),
    onShareClick: fn(),
  },
} satisfies Meta<typeof PostCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    post: {
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
    },
  },
};

export const WithImage: Story = {
  args: {
    post: {
      id: 5,
      subreddit: "r/art",
      author: "u/creativeCanvas",
      time: "11h ago",
      title: "Finished my first oil painting after years of wanting to learn",
      content: "I'm so proud of how this turned out. It took me about 40 hours over 2 weeks.",
      upvotes: 9200,
      comments: 567,
      awards: 15,
      image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23FF6B6B;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23FFD93D;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="400" fill="url(%23grad)"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white"%3EOil Painting Artwork%3C/text%3E%3C/svg%3E',
      flair: "Original Work",
    },
  },
};

export const NoFlair: Story = {
  args: {
    post: {
      id: 2,
      subreddit: "r/gaming",
      author: "u/pixelmaster",
      time: "5h ago",
      title: "After 300 hours, I finally completed every achievement in Elden Ring",
      content: "What a journey this has been. The hardest part was definitely Malenia!",
      upvotes: 8900,
      comments: 456,
      awards: 12,
    },
  },
};

export const Upvoted: Story = {
  args: {
    post: {
      id: 3,
      subreddit: "r/science",
      author: "u/labCoat42",
      time: "7h ago",
      title: "New study reveals connection between sleep patterns and memory formation",
      content: "A comprehensive 5-year study involving 10,000 participants has uncovered surprising insights.",
      upvotes: 15600,
      comments: 1203,
      awards: 8,
      flair: "Neuroscience",
    },
    votedPosts: { 3: "up" },
  },
};

export const Downvoted: Story = {
  args: {
    post: {
      id: 4,
      subreddit: "r/movies",
      author: "u/cinephile2024",
      time: "9h ago",
      title: 'Hot take: "The Prestige" is overrated',
      content: "I know this is unpopular but hear me out...",
      upvotes: 6700,
      comments: 289,
      awards: 0,
      flair: "Discussion",
    },
    votedPosts: { 4: "down" },
  },
};
