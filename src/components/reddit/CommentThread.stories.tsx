import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { CommentThread } from "./CommentThread";

const meta = {
  title: "Reddit/CommentThread",
  component: CommentThread,
  parameters: {
    layout: "centered",
    backgrounds: { disable: true },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 390, width: "100%", padding: 16 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    onVote: fn(),
    onShare: fn(),
  },
} satisfies Meta<typeof CommentThread>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    comment: {
      id: 1,
      author: "u/quantum_physicist",
      time: "2h ago",
      content: "This is absolutely groundbreaking! I've been following this research group for years and they've consistently delivered impressive results.",
      upvotes: 456,
      replies: [],
    },
  },
};

export const WithReplies: Story = {
  args: {
    comment: {
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
          content: "Agreed! This could completely change how we approach encryption in the next decade.",
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
    },
  },
};

export const OPComment: Story = {
  args: {
    comment: {
      id: 12,
      author: "u/techEnthusiast",
      time: "1h ago",
      content: "Thanks for the kind words! I'm excited to share more updates as the research progresses.",
      upvotes: 234,
      isOP: true,
      replies: [],
    },
  },
};

export const Upvoted: Story = {
  args: {
    comment: {
      id: 4,
      author: "u/industryInsider",
      time: "1h ago",
      content: "I work in the quantum computing industry and this is genuinely significant. The 40% error reduction is no joke.",
      upvotes: 567,
      replies: [],
    },
    votedComments: { 4: "up" },
  },
};

export const AsReply: Story = {
  args: {
    comment: {
      id: 21,
      author: "u/quantumSimplified",
      time: "1h ago",
      content: "Traditional quantum computers struggle with errors because qubits are very fragile. This new method uses a clever error-correction technique.",
      upvotes: 412,
    },
    isReply: true,
  },
};
