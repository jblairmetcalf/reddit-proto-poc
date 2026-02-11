import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SearchInput from "./SearchInput";

const meta = {
  title: "Infrastructure/SearchInput",
  component: SearchInput,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: "",
    onChange: () => {},
    placeholder: "Search by name, role, status...",
  },
};

export const WithQuery: Story = {
  args: {
    value: "feed sorting",
    onChange: () => {},
    placeholder: "Search...",
    resultCount: 3,
  },
};

export const NoResults: Story = {
  args: {
    value: "xyznotfound",
    onChange: () => {},
    placeholder: "Search...",
    resultCount: 0,
  },
};

export const Interactive: Story = {
  args: { value: "", onChange: () => {} },
  render: () => {
    const [value, setValue] = useState("");
    const items = ["Feed Sorting", "Dark Mode", "Comment Thread", "Upvote Animation"];
    const filtered = value.trim()
      ? items.filter((i) => i.toLowerCase().includes(value.toLowerCase()))
      : items;

    return (
      <div className="w-96 space-y-4">
        <SearchInput
          value={value}
          onChange={setValue}
          placeholder="Search prototypes..."
          resultCount={value.trim() ? filtered.length : undefined}
        />
        <ul className="space-y-1 text-sm text-foreground">
          {filtered.map((item) => (
            <li key={item} className="rounded-lg bg-card px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  },
};
