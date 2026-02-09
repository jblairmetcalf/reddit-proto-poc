import { NextRequest, NextResponse } from "next/server";
import {
  getPopularPosts,
  getSubredditPosts,
  getPostComments,
  searchSubreddits,
  getPopularSubreddits,
} from "@/lib/reddit";
import type { RedditSort, CommentSort } from "@/lib/types/reddit";

const VALID_SORTS: RedditSort[] = ["hot", "new", "top", "rising"];
const VALID_COMMENT_SORTS: CommentSort[] = ["best", "top", "new", "controversial"];
const SAFE_NAME = /^[a-zA-Z0-9_]+$/;

function parseLimit(raw: string | null, defaultVal: number): number {
  const n = Number(raw ?? defaultVal);
  if (isNaN(n) || n < 1) return defaultVal;
  return Math.min(n, 100);
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "popular": {
        const sortRaw = searchParams.get("sort") ?? "hot";
        const sort = VALID_SORTS.includes(sortRaw as RedditSort) ? (sortRaw as RedditSort) : "hot";
        const limit = parseLimit(searchParams.get("limit"), 25);
        const after = searchParams.get("after") ?? undefined;
        const data = await getPopularPosts(sort, limit, after);
        return NextResponse.json(data);
      }

      case "subreddit": {
        const sub = searchParams.get("subreddit");
        if (!sub) return NextResponse.json({ error: "subreddit required" }, { status: 400 });
        if (!SAFE_NAME.test(sub)) return NextResponse.json({ error: "Invalid subreddit name" }, { status: 400 });
        const sortRaw = searchParams.get("sort") ?? "hot";
        const sort = VALID_SORTS.includes(sortRaw as RedditSort) ? (sortRaw as RedditSort) : "hot";
        const limit = parseLimit(searchParams.get("limit"), 25);
        const after = searchParams.get("after") ?? undefined;
        const data = await getSubredditPosts(sub, sort, limit, after);
        return NextResponse.json(data);
      }

      case "comments": {
        const sub = searchParams.get("subreddit");
        const postId = searchParams.get("postId");
        if (!sub || !postId)
          return NextResponse.json({ error: "subreddit and postId required" }, { status: 400 });
        if (!SAFE_NAME.test(sub)) return NextResponse.json({ error: "Invalid subreddit name" }, { status: 400 });
        if (!SAFE_NAME.test(postId)) return NextResponse.json({ error: "Invalid postId" }, { status: 400 });
        const sortRaw = searchParams.get("sort") ?? "best";
        const sort = VALID_COMMENT_SORTS.includes(sortRaw as CommentSort) ? (sortRaw as CommentSort) : "best";
        const data = await getPostComments(sub, postId, sort);
        return NextResponse.json(data);
      }

      case "search_subreddits": {
        const q = searchParams.get("q");
        if (!q) return NextResponse.json({ error: "q required" }, { status: 400 });
        const limit = parseLimit(searchParams.get("limit"), 10);
        const data = await searchSubreddits(q, limit);
        return NextResponse.json(data);
      }

      case "popular_subreddits": {
        const limit = parseLimit(searchParams.get("limit"), 25);
        const data = await getPopularSubreddits(limit);
        return NextResponse.json(data);
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err) {
    console.error("Reddit API error:", err);
    return NextResponse.json(
      { error: "Reddit API request failed" },
      { status: 500 }
    );
  }
}
