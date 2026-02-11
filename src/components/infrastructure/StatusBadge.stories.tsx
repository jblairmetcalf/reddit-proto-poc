import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import StatusBadge, {
  STUDY_STATUS_STYLES,
  PARTICIPANT_STATUS_STYLES,
  PROTOTYPE_STATUS_STYLES,
  ROLE_STYLES,
  VARIANT_BADGE_COLORS,
} from "./StatusBadge";

const meta = {
  title: "Infrastructure/StatusBadge",
  component: StatusBadge,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { status: "active" },
};

export const StudyStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {Object.keys(STUDY_STATUS_STYLES).map((s) => (
        <StatusBadge key={s} status={s} styleMap={STUDY_STATUS_STYLES} />
      ))}
    </div>
  ),
};

export const ParticipantStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {Object.keys(PARTICIPANT_STATUS_STYLES).map((s) => (
        <StatusBadge key={s} status={s} styleMap={PARTICIPANT_STATUS_STYLES} />
      ))}
    </div>
  ),
};

export const PrototypeStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {Object.keys(PROTOTYPE_STATUS_STYLES).map((s) => (
        <StatusBadge key={s} status={s} styleMap={PROTOTYPE_STATUS_STYLES} />
      ))}
    </div>
  ),
};

export const Roles: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {Object.keys(ROLE_STYLES).map((s) => (
        <StatusBadge key={s} status={s} styleMap={ROLE_STYLES} />
      ))}
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {Object.keys(VARIANT_BADGE_COLORS).map((s) => (
        <StatusBadge key={s} status={s} styleMap={VARIANT_BADGE_COLORS} />
      ))}
    </div>
  ),
};

export const SmallSize: Story = {
  args: {
    status: "active",
    styleMap: PARTICIPANT_STATUS_STYLES,
    size: "sm",
  },
};
