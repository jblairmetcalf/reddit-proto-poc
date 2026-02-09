import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { CommunityItem } from "./CommunityItem";

const meta = {
  title: "Reddit/CommunityItem",
  component: CommunityItem,
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
} satisfies Meta<typeof CommunityItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    community: {
      name: "r/technology",
      members: "14.2M",
      icon: "💻",
      color: "#FF4500",
    },
  },
};

export const WithJoinButton: Story = {
  args: {
    community: {
      name: "r/gaming",
      members: "37.8M",
      icon: "🎮",
      color: "#0079D3",
    },
    showChevron: false,
    showJoinButton: true,
  },
};

export const Science: Story = {
  args: {
    community: {
      name: "r/science",
      members: "30.1M",
      icon: "🔬",
      color: "#46D160",
    },
  },
};

export const Art: Story = {
  args: {
    community: {
      name: "r/art",
      members: "25.7M",
      icon: "🎨",
      color: "#FFB000",
    },
  },
};

export const Music: Story = {
  args: {
    community: {
      name: "r/music",
      members: "32.3M",
      icon: "🎵",
      color: "#7193FF",
    },
  },
};
