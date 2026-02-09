export interface RedditPost {
  id: string;
  subreddit: string;
  subreddit_name_prefixed: string;
  author: string;
  title: string;
  selftext: string;
  score: number;
  num_comments: number;
  total_awards_received: number;
  thumbnail: string;
  url: string;
  permalink: string;
  created_utc: number;
  link_flair_text: string | null;
  is_self: boolean;
  preview?: {
    images: Array<{
      source: { url: string; width: number; height: number };
      resolutions: Array<{ url: string; width: number; height: number }>;
    }>;
  };
}

export interface RedditComment {
  id: string;
  author: string;
  body: string;
  score: number;
  created_utc: number;
  is_submitter: boolean;
  replies?: {
    data: {
      children: Array<{ data: RedditComment }>;
    };
  };
}

export interface RedditSubreddit {
  display_name: string;
  display_name_prefixed: string;
  subscribers: number;
  icon_img: string;
  primary_color: string;
  public_description: string;
}

export interface RedditListing<T> {
  kind: string;
  data: {
    after: string | null;
    before: string | null;
    children: Array<{ kind: string; data: T }>;
  };
}

export type RedditSort = "hot" | "new" | "top" | "rising";
export type CommentSort = "best" | "top" | "new" | "controversial";
