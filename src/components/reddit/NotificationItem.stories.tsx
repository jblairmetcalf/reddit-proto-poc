import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { NotificationItem } from "./NotificationItem";

const meta = {
  title: "Reddit/NotificationItem",
  component: NotificationItem,
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
    onClick: fn(),
  },
} satisfies Meta<typeof NotificationItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Upvote: Story = {
  args: {
    notification: {
      id: 1,
      type: "upvote",
      message: "u/randomUser upvoted your post in r/technology",
      time: "2h ago",
      unread: true,
    },
  },
};

export const Comment: Story = {
  args: {
    notification: {
      id: 2,
      type: "comment",
      message: "u/commenter123 replied to your comment in r/gaming",
      time: "5h ago",
      unread: true,
    },
  },
};

export const AwardNotification: Story = {
  args: {
    notification: {
      id: 3,
      type: "award",
      message: "Your post received a Gold Award!",
      time: "1d ago",
      unread: false,
    },
  },
};

export const Trending: Story = {
  args: {
    notification: {
      id: 4,
      type: "trending",
      message: "Your post is trending in r/science",
      time: "2d ago",
      unread: false,
    },
  },
};

export const Read: Story = {
  args: {
    notification: {
      id: 5,
      type: "upvote",
      message: "u/anotherUser upvoted your comment in r/movies",
      time: "3d ago",
      unread: false,
    },
  },
};
