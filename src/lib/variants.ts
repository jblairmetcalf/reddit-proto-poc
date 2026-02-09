export interface VariantConfig {
  id: string;
  label: string;
  defaultSort: "best" | "hot" | "new" | "top" | "rising";
  feedDensity: "default" | "compact";
  showAwards: boolean;
  showFlairs: boolean;
  commentSort: "best" | "top" | "new" | "controversial";
  showVoteCount: boolean;
}

export const VARIANT_PRESETS: Record<string, VariantConfig> = {
  default: {
    id: "default",
    label: "Default",
    defaultSort: "best",
    feedDensity: "default",
    showAwards: true,
    showFlairs: true,
    commentSort: "best",
    showVoteCount: true,
  },
  "variant-a": {
    id: "variant-a",
    label: "Variant A",
    defaultSort: "hot",
    feedDensity: "compact",
    showAwards: true,
    showFlairs: true,
    commentSort: "top",
    showVoteCount: false,
  },
  "variant-b": {
    id: "variant-b",
    label: "Variant B",
    defaultSort: "new",
    feedDensity: "default",
    showAwards: false,
    showFlairs: true,
    commentSort: "new",
    showVoteCount: true,
  },
  "variant-c": {
    id: "variant-c",
    label: "Variant C",
    defaultSort: "top",
    feedDensity: "compact",
    showAwards: false,
    showFlairs: false,
    commentSort: "best",
    showVoteCount: false,
  },
};
