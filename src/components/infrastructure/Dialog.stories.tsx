import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import Dialog from "./Dialog";

const meta = {
  title: "Infrastructure/Dialog",
  component: Dialog,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    open: true,
    onClose: fn(),
    onSubmit: fn(),
    title: "Add Prototyper",
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-secondary">Name</label>
          <input
            autoFocus
            type="text"
            placeholder="e.g., Blair Metcalf"
            className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-secondary">Email</label>
          <input
            type="email"
            placeholder="prototyper@example.com"
            className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
          />
        </div>
      </div>
    ),
    footer: (
      <div className="flex items-center justify-end gap-3 pt-1">
        <button className="rounded-lg border border-edge-strong px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-foreground">
          Cancel
        </button>
        <button className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500">
          Add Prototyper
        </button>
      </div>
    ),
  },
};

export const Small: Story = {
  args: {
    title: "Confirm Action",
    maxWidth: "sm",
    children: <p className="text-sm text-secondary">Are you sure?</p>,
  },
};

export const Large: Story = {
  args: {
    title: "Edit Prototype",
    maxWidth: "lg",
    children: (
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-secondary">Title</label>
          <input
            type="text"
            placeholder="Prototype title"
            className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-secondary">Description</label>
          <textarea
            placeholder="What does this prototype explore?"
            rows={3}
            className="w-full rounded-lg border border-edge-strong bg-input px-3 py-2 text-sm text-foreground placeholder:text-faint focus:border-orange-500 focus:outline-none resize-none"
          />
        </div>
      </div>
    ),
  },
};

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
        >
          Open Dialog
        </button>
        <Dialog open={open} onClose={() => setOpen(false)} title="Interactive Dialog">
          <p className="text-sm text-secondary">
            Press Escape to close, or click outside.
          </p>
        </Dialog>
      </>
    );
  },
};
