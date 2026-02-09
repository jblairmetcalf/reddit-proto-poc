import type {
  RedditListing,
  RedditPost,
  RedditComment,
  RedditSubreddit,
  RedditSort,
  CommentSort,
} from "./types/reddit";

let accessToken: string | null = null;
let tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) return accessToken;

  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Reddit API credentials not configured");
  }

  const res = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "reddit-proto-poc/0.1.0",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(`Reddit auth failed: ${res.status}`);

  const data = await res.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000 - 60_000;
  return accessToken!;
}

async function redditFetch(path: string): Promise<unknown> {
  const token = await getAccessToken();
  const res = await fetch(`https://oauth.reddit.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "reddit-proto-poc/0.1.0",
    },
  });
  if (!res.ok) throw new Error(`Reddit API error: ${res.status}`);
  return res.json();
}

export async function getPopularPosts(
  sort: RedditSort = "hot",
  limit = 25,
  after?: string
): Promise<RedditListing<RedditPost>> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (after) params.set("after", after);
  return redditFetch(`/r/popular/${sort}?${params}`) as Promise<RedditListing<RedditPost>>;
}

export async function getSubredditPosts(
  subreddit: string,
  sort: RedditSort = "hot",
  limit = 25,
  after?: string
): Promise<RedditListing<RedditPost>> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (after) params.set("after", after);
  return redditFetch(`/r/${subreddit}/${sort}?${params}`) as Promise<RedditListing<RedditPost>>;
}

export async function getPostComments(
  subreddit: string,
  postId: string,
  sort: CommentSort = "best"
): Promise<[RedditListing<RedditPost>, RedditListing<RedditComment>]> {
  return redditFetch(
    `/r/${subreddit}/comments/${postId}?sort=${sort}`
  ) as Promise<[RedditListing<RedditPost>, RedditListing<RedditComment>]>;
}

export async function searchSubreddits(
  query: string,
  limit = 10
): Promise<RedditListing<RedditSubreddit>> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  return redditFetch(`/subreddits/search?${params}`) as Promise<RedditListing<RedditSubreddit>>;
}

export async function getPopularSubreddits(
  limit = 25
): Promise<RedditListing<RedditSubreddit>> {
  return redditFetch(`/subreddits/popular?limit=${limit}`) as Promise<
    RedditListing<RedditSubreddit>
  >;
}
