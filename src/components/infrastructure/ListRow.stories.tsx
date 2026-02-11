import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ListRow from "./ListRow";
import Button from "./Button";

const meta = {
  title: "Infrastructure/ListRow",
  component: ListRow,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof ListRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Feed Sorting Prototype
        </h3>
        <p className="mt-0.5 text-xs text-muted">Blair Metcalf &middot; Jan 15, 2025</p>
      </div>
    ),
    actions: (
      <>
        <Button variant="outline" size="sm">
          Preview
        </Button>
        <Button variant="outline" size="sm">
          Create Study
        </Button>
      </>
    ),
  },
};

export const NoActions: Story = {
  name: "No actions",
  args: {
    children: (
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Simple row with content only
        </h3>
        <p className="mt-0.5 text-xs text-muted">No action buttons</p>
      </div>
    ),
  },
};

export const AlignStart: Story = {
  name: "Align start",
  args: {
    align: "start",
    children: (
      <div>
        <h3 className="text-sm font-semibold text-foreground">
          Multi-line content
        </h3>
        <p className="mt-1 text-xs text-muted">
          This row has more content that might wrap to multiple lines,
          so the actions align to the start instead of center.
        </p>
      </div>
    ),
    actions: (
      <Button variant="ghost" dangerHover size="sm">
        Delete
      </Button>
    ),
  },
};

export const List: Story = {
  name: "Multiple rows",
  args: { children: null },
  render: () => (
    <div className="space-y-3">
      {["Dark Mode Toggle", "Comment Thread v2", "Upvote Animation"].map(
        (title) => (
          <ListRow
            key={title}
            actions={
              <>
                <Button variant="outline" size="sm">
                  Preview
                </Button>
                <Button variant="ghost" dangerHover size="sm">
                  Delete
                </Button>
              </>
            }
          >
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="mt-0.5 text-xs text-muted">Draft &middot; Default variant</p>
          </ListRow>
        )
      )}
    </div>
  ),
};
