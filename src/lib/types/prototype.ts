export interface PrototypePost {
  id: number | string;
  subreddit: string;
  author: string;
  time: string;
  title: string;
  content: string;
  upvotes: number;
  comments: number;
  awards: number;
  image?: string;
  flair?: string;
  permalink?: string;
  subredditForApi?: string;
  redditId?: string;
}

export interface PrototypeComment {
  id: number | string;
  author: string;
  time: string;
  content: string;
  upvotes: number;
  isOP?: boolean;
  replies?: PrototypeComment[];
}

export interface PrototypeSubreddit {
  name: string;
  members: string;
  icon: string;
  color: string;
}

export interface PrototypeNotification {
  id: number;
  type: "upvote" | "comment" | "award" | "trending";
  message: string;
  time: string;
  unread: boolean;
}

export type VoteState = Record<string | number, "up" | "down" | null>;
