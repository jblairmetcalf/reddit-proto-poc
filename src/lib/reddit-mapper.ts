import type { RedditPost, RedditComment, RedditSubreddit } from "./types/reddit";
import type { PrototypePost, PrototypeComment, PrototypeSubreddit } from "./types/prototype";

function timeAgo(utc: number): string {
  const seconds = Math.floor(Date.now() / 1000 - utc);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatSubscribers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
  return count.toString();
}

function getPreviewImage(post: RedditPost): string | undefined {
  if (post.preview?.images?.[0]?.source?.url) {
    return post.preview.images[0].source.url.replace(/&amp;/g, "&");
  }
  if (
    post.thumbnail &&
    post.thumbnail !== "self" &&
    post.thumbnail !== "default" &&
    post.thumbnail !== "nsfw" &&
    post.thumbnail !== "spoiler"
  ) {
    return post.thumbnail;
  }
  return undefined;
}

export function mapRedditPost(post: RedditPost): PrototypePost {
  const idParts = post.permalink?.split("/") ?? [];
  const redditId = idParts[4] ?? post.id;

  return {
    id: post.id,
    subreddit: post.subreddit_name_prefixed,
    author: `u/${post.author}`,
    time: timeAgo(post.created_utc),
    title: post.title,
    content: post.selftext?.slice(0, 300) || "",
    upvotes: post.score,
    comments: post.num_comments,
    awards: post.total_awards_received,
    image: getPreviewImage(post),
    flair: post.link_flair_text ?? undefined,
    permalink: post.permalink,
    subredditForApi: post.subreddit,
    redditId,
  };
}

export function mapRedditComment(comment: RedditComment): PrototypeComment {
  const replies: PrototypeComment[] = [];
  if (comment.replies?.data?.children) {
    for (const child of comment.replies.data.children) {
      if (child.data.author) {
        replies.push(mapRedditComment(child.data));
      }
    }
  }

  return {
    id: comment.id,
    author: `u/${comment.author}`,
    time: timeAgo(comment.created_utc),
    content: comment.body,
    upvotes: comment.score,
    isOP: comment.is_submitter,
    replies,
  };
}

const SUBREDDIT_ICONS: Record<string, string> = {
  technology: "💻",
  gaming: "🎮",
  science: "🔬",
  movies: "🎬",
  music: "🎵",
  books: "📚",
  art: "🎨",
  photography: "📷",
  food: "🍕",
  fitness: "💪",
  pics: "🖼️",
  funny: "😂",
  askreddit: "❓",
  worldnews: "🌍",
  news: "📰",
  sports: "⚽",
  television: "📺",
  todayilearned: "💡",
  aww: "🐾",
  memes: "🎭",
};

const SUBREDDIT_COLORS = [
  "#FF4500",
  "#0079D3",
  "#46D160",
  "#7193FF",
  "#FF66AC",
  "#FFB000",
  "#24A0ED",
];

export function mapRedditSubreddit(sub: RedditSubreddit): PrototypeSubreddit {
  const name = sub.display_name.toLowerCase();
  const icon = SUBREDDIT_ICONS[name] || "📌";
  const color =
    sub.primary_color ||
    SUBREDDIT_COLORS[
      name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
        SUBREDDIT_COLORS.length
    ];

  return {
    name: sub.display_name_prefixed,
    members: formatSubscribers(sub.subscribers),
    icon,
    color,
  };
}
