import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CommentCard from "./CommentCard";

const meta = {
  title: "Brand/CommentCard",
  component: CommentCard,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CommentCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "u/blair_ux",
    role: "Lead Prototyper, 2 yrs",
    avatar: "B",
    text: "This platform changed how we ship prototypes. From concept to user test in a day — not a sprint.",
    upvotes: 142,
  },
};

export const WithoutUpvotes: Story = {
  name: "Without upvotes",
  args: {
    name: "u/alex_eng",
    role: "Frontend Engineer",
    avatar: "A",
    text: "The real-time dashboard is a game-changer. Watching participants interact live beats any analytics tool.",
  },
};

export const CommentScroll: Story = {
  name: "Horizontal scroll",
  args: { name: "", text: "" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 700 }}>
        <Story />
      </div>
    ),
  ],
  render: () => {
    const comments = [
      {
        name: "u/blair_ux",
        role: "Lead Prototyper, 2 yrs",
        avatar: "B",
        text: "This platform changed how we ship prototypes. From concept to user test in a day — not a sprint.",
        upvotes: 142,
      },
      {
        name: "u/priya_research",
        role: "UX Researcher, 3 yrs",
        avatar: "P",
        text: "Running moderated and unmoderated studies from one place? With real-time events? Yes please.",
        upvotes: 89,
      },
      {
        name: "u/jordan_pm",
        role: "Product Manager",
        avatar: "J",
        text: "The AI summaries save me hours of session review. I get the signal without watching every recording.",
        upvotes: 167,
      },
    ];
    return (
      <div
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          padding: "10px 0 20px",
          scrollbarWidth: "none",
        }}
      >
        {comments.map((c) => (
          <CommentCard
            key={c.name}
            {...c}
            style={{
              minWidth: 280,
              maxWidth: 300,
              flexShrink: 0,
              scrollSnapAlign: "start",
            }}
          />
        ))}
      </div>
    );
  },
};
