import { NextRequest, NextResponse } from "next/server";
import {
  getPopularPosts,
  getSubredditPosts,
  getPostComments,
  searchSubreddits,
  getPopularSubreddits,
} from "@/lib/reddit";
import type { RedditSort, CommentSort } from "@/lib/types/reddit";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const action = searchParams.get("action");

  try {
    switch (action) {
      case "popular": {
        const sort = (searchParams.get("sort") ?? "hot") as RedditSort;
        const limit = Number(searchParams.get("limit") ?? 25);
        const after = searchParams.get("after") ?? undefined;
        const data = await getPopularPosts(sort, limit, after);
        return NextResponse.json(data);
      }

      case "subreddit": {
        const sub = searchParams.get("subreddit");
        if (!sub) return NextResponse.json({ error: "subreddit required" }, { status: 400 });
        const sort = (searchParams.get("sort") ?? "hot") as RedditSort;
        const limit = Number(searchParams.get("limit") ?? 25);
        const after = searchParams.get("after") ?? undefined;
        const data = await getSubredditPosts(sub, sort, limit, after);
        return NextResponse.json(data);
      }

      case "comments": {
        const sub = searchParams.get("subreddit");
        const postId = searchParams.get("postId");
        if (!sub || !postId)
          return NextResponse.json({ error: "subreddit and postId required" }, { status: 400 });
        const sort = (searchParams.get("sort") ?? "best") as CommentSort;
        const data = await getPostComments(sub, postId, sort);
        return NextResponse.json(data);
      }

      case "search_subreddits": {
        const q = searchParams.get("q");
        if (!q) return NextResponse.json({ error: "q required" }, { status: 400 });
        const limit = Number(searchParams.get("limit") ?? 10);
        const data = await searchSubreddits(q, limit);
        return NextResponse.json(data);
      }

      case "popular_subreddits": {
        const limit = Number(searchParams.get("limit") ?? 25);
        const data = await getPopularSubreddits(limit);
        return NextResponse.json(data);
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (err) {
    console.error("Reddit API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
