import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import CardGrid from "./CardGrid";

const meta = {
  title: "Infrastructure/CardGrid",
  component: CardGrid,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof CardGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

function SampleCard({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-edge bg-card p-6">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-secondary">Sample card content</p>
    </div>
  );
}

export const ThreeColumns: Story = {
  name: "3 columns (default)",
  args: {
    children: (
      <>
        <SampleCard title="Study A" />
        <SampleCard title="Study B" />
        <SampleCard title="Study C" />
        <SampleCard title="Study D" />
        <SampleCard title="Study E" />
      </>
    ),
  },
};

export const TwoColumns: Story = {
  name: "2 columns",
  args: {
    columns: 2,
    children: (
      <>
        <SampleCard title="Card 1" />
        <SampleCard title="Card 2" />
        <SampleCard title="Card 3" />
        <SampleCard title="Card 4" />
      </>
    ),
  },
};

export const FourColumns: Story = {
  name: "4 columns",
  args: {
    columns: 4,
    gap: "5",
    children: (
      <>
        {Array.from({ length: 8 }, (_, i) => (
          <SampleCard key={i} title={`Item ${i + 1}`} />
        ))}
      </>
    ),
  },
};

export const LargeGap: Story = {
  name: "Large gap",
  args: {
    gap: "6",
    children: (
      <>
        <SampleCard title="Spaced A" />
        <SampleCard title="Spaced B" />
        <SampleCard title="Spaced C" />
      </>
    ),
  },
};
