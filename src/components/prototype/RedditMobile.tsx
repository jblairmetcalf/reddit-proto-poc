"use client";

import React, { useState } from "react";
import {
  Home,
  Bell,
  User,
  Menu,
  Search,
  TrendingUp,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  ChevronUp,
  Award,
  Eye,
  ArrowLeft,
  Send,
} from "lucide-react";
import type {
  PrototypePost,
  PrototypeComment,
  PrototypeSubreddit,
  PrototypeNotification,
  VoteState,
} from "@/lib/types/prototype";
import type { VariantConfig } from "@/lib/variants";

interface RedditMobileProps {
  posts?: PrototypePost[];
  subreddits?: PrototypeSubreddit[];
  onTrack?: (event: string, data?: Record<string, unknown>) => void;
  onLoadComments?: (
    subreddit: string,
    postId: string,
    sort: string
  ) => Promise<PrototypeComment[]>;
  variantConfig?: VariantConfig;
}

const DEFAULT_POSTS: PrototypePost[] = [
  {
    id: 1,
    subreddit: "r/technology",
    author: "u/techEnthusiast",
    time: "3h ago",
    title:
      "New breakthrough in quantum computing shows promise for real-world applications",
    content:
      "Researchers at MIT have developed a new approach that could make quantum computers more practical for everyday use. The team has successfully demonstrated a method to reduce error rates by 40%.",
    upvotes: 12400,
    comments: 834,
    awards: 5,
    image:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%234A90E2"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white"%3EQuantum Computing Research%3C/text%3E%3C/svg%3E',
    flair: "Research",
  },
  {
    id: 2,
    subreddit: "r/gaming",
    author: "u/pixelmaster",
    time: "5h ago",
    title:
      "After 300 hours, I finally completed every achievement in Elden Ring",
    content:
      "What a journey this has been. Here are some tips for anyone attempting the same challenge. The hardest part was definitely Malenia, but with patience and the right build, anything is possible!",
    upvotes: 8900,
    comments: 456,
    awards: 12,
    flair: "Achievement",
  },
  {
    id: 3,
    subreddit: "r/science",
    author: "u/labCoat42",
    time: "7h ago",
    title:
      "New study reveals fascinating connection between sleep patterns and memory formation",
    content:
      "A comprehensive 5-year study involving 10,000 participants has uncovered surprising insights about how our brains consolidate memories during different sleep stages.",
    upvotes: 15600,
    comments: 1203,
    awards: 8,
    image:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Crect width="800" height="400" fill="%2346D160"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white"%3ESleep and Memory Study%3C/text%3E%3C/svg%3E',
    flair: "Neuroscience",
  },
  {
    id: 4,
    subreddit: "r/movies",
    author: "u/cinephile2024",
    time: "9h ago",
    title:
      'Just watched "The Prestige" for the 10th time and noticed this incredible detail',
    content:
      "In the opening scene, you can actually see a subtle hint about the ending that I never noticed before. Christopher Nolan is a genius at planting these easter eggs!",
    upvotes: 6700,
    comments: 289,
    awards: 3,
    flair: "Discussion",
  },
  {
    id: 5,
    subreddit: "r/art",
    author: "u/creativeCanvas",
    time: "11h ago",
    title:
      "Finished my first oil painting after years of wanting to learn",
    content:
      "I'm so proud of how this turned out. It took me about 40 hours over 2 weeks. Constructive criticism welcome!",
    upvotes: 9200,
    comments: 567,
    awards: 15,
    image:
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="400"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%23FF6B6B;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%23FFD93D;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="400" fill="url(%23grad)"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white"%3EOil Painting Artwork%3C/text%3E%3C/svg%3E',
    flair: "Original Work",
  },
  {
    id: 6,
    subreddit: "r/gaming",
    author: "u/speedRunner88",
    time: "13h ago",
    title: "World record speedrun: Beat Dark Souls in 23 minutes",
    content:
      "After months of practice and optimization, I finally got the world record! Here's a breakdown of the route and strategies I used.",
    upvotes: 11200,
    comments: 623,
    awards: 18,
    flair: "Achievement",
  },
  {
    id: 7,
    subreddit: "r/movies",
    author: "u/filmBuff",
    time: "14h ago",
    title: 'Why "Blade Runner 2049" is the perfect sequel',
    content:
      "Let's discuss how Denis Villeneuve managed to create a sequel that honors the original while telling its own compelling story.",
    upvotes: 5400,
    comments: 412,
    awards: 6,
    flair: "Discussion",
  },
];

const DEFAULT_SUBREDDITS: PrototypeSubreddit[] = [
  { name: "r/technology", members: "14.2M", icon: "💻", color: "#FF4500" },
  { name: "r/gaming", members: "37.8M", icon: "🎮", color: "#0079D3" },
  { name: "r/science", members: "30.1M", icon: "🔬", color: "#46D160" },
  { name: "r/movies", members: "28.5M", icon: "🎬", color: "#FF4500" },
  { name: "r/music", members: "32.3M", icon: "🎵", color: "#7193FF" },
  { name: "r/books", members: "22.1M", icon: "📚", color: "#FF66AC" },
  { name: "r/art", members: "25.7M", icon: "🎨", color: "#FFB000" },
  {
    name: "r/photography",
    members: "19.4M",
    icon: "📷",
    color: "#24A0ED",
  },
  { name: "r/food", members: "27.9M", icon: "🍕", color: "#FF4500" },
  { name: "r/fitness", members: "11.2M", icon: "💪", color: "#0079D3" },
];

const DEFAULT_COMMENTS: PrototypeComment[] = [
  {
    id: 1,
    author: "u/quantum_physicist",
    time: "2h ago",
    content:
      "This is absolutely groundbreaking! I've been following this research group for years and they've consistently delivered impressive results. The implications for cryptography alone are massive.",
    upvotes: 456,
    replies: [
      {
        id: 11,
        author: "u/cryptoExpert",
        time: "1h ago",
        content:
          "Agreed! This could completely change how we approach encryption in the next decade. Very exciting times.",
        upvotes: 123,
      },
      {
        id: 12,
        author: "u/techEnthusiast",
        time: "1h ago",
        content:
          "Thanks for the support! I'm excited to see where this technology goes. The team is already working on practical applications.",
        upvotes: 234,
        isOP: true,
      },
    ],
  },
  {
    id: 2,
    author: "u/scienceTeacher",
    time: "2h ago",
    content:
      "Can someone ELI5 what makes this approach different from previous quantum computing methods?",
    upvotes: 289,
    replies: [
      {
        id: 21,
        author: "u/quantumSimplified",
        time: "1h ago",
        content:
          "Sure! Traditional quantum computers struggle with errors because qubits are very fragile. This new method uses a clever error-correction technique that doesn't require as many physical qubits, making it more practical to build.",
        upvotes: 412,
      },
    ],
  },
  {
    id: 3,
    author: "u/skepticalScientist",
    time: "1h ago",
    content:
      "While this is impressive, we should be cautious about overhyping quantum computing. We're still many years away from practical, everyday applications.",
    upvotes: 178,
    replies: [],
  },
  {
    id: 4,
    author: "u/industryInsider",
    time: "1h ago",
    content:
      "I work in the quantum computing industry and this is genuinely significant. The 40% error reduction is no joke - that's the kind of improvement that can accelerate timelines by years.",
    upvotes: 567,
    replies: [],
  },
];

const DEFAULT_NOTIFICATIONS: PrototypeNotification[] = [
  {
    id: 1,
    type: "upvote",
    message: "u/randomUser upvoted your post in r/technology",
    time: "2h ago",
    unread: true,
  },
  {
    id: 2,
    type: "comment",
    message: "u/commenter123 replied to your comment in r/gaming",
    time: "5h ago",
    unread: true,
  },
  {
    id: 3,
    type: "award",
    message: "Your post received a Gold Award!",
    time: "1d ago",
    unread: false,
  },
  {
    id: 4,
    type: "trending",
    message: "Your post is trending in r/science",
    time: "2d ago",
    unread: false,
  },
];

const RedditMobile: React.FC<RedditMobileProps> = ({
  posts: propPosts,
  subreddits: propSubreddits,
  onTrack,
  onLoadComments,
  variantConfig,
}) => {
  const posts = propPosts ?? DEFAULT_POSTS;
  const subreddits = propSubreddits ?? DEFAULT_SUBREDDITS;

  const vc = variantConfig;
  const [activeTab, setActiveTab] = useState("home");
  const [showSubredditMenu, setShowSubredditMenu] = useState(false);
  const [votedPosts, setVotedPosts] = useState<VoteState>({});
  const [currentView, setCurrentView] = useState("feed");
  const [selectedPost, setSelectedPost] = useState<PrototypePost | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [votedComments, setVotedComments] = useState<VoteState>({});
  const [subredditSearch, setSubredditSearch] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showCreateSheet, setShowCreateSheet] = useState(false);
  const [selectedCommunity, setSelectedCommunity] =
    useState<PrototypeSubreddit | null>(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [commentSort, setCommentSort] = useState<string>(vc?.commentSort ?? "best");
  const [activeComments, setActiveComments] =
    useState<PrototypeComment[]>(DEFAULT_COMMENTS);

  const track = (event: string, data?: Record<string, unknown>) => {
    onTrack?.(event, data);
  };

  const handleVote = (postId: number | string, voteType: "up" | "down") => {
    setVotedPosts((prev) => ({
      ...prev,
      [postId]: prev[postId] === voteType ? null : voteType,
    }));
    track("vote", { postId, voteType });
  };

  const handleCommentVote = (
    commentId: number | string,
    voteType: "up" | "down"
  ) => {
    setVotedComments((prev) => ({
      ...prev,
      [commentId]: prev[commentId] === voteType ? null : voteType,
    }));
    track("comment_vote", { commentId, voteType });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  const navigateToPost = async (post: PrototypePost) => {
    setSelectedPost(post);
    setCurrentView("post-detail");
    track("post_click", { postId: post.id, subreddit: post.subreddit });

    if (onLoadComments && post.subredditForApi && post.redditId) {
      try {
        const comments = await onLoadComments(
          post.subredditForApi,
          post.redditId,
          commentSort
        );
        if (comments.length > 0) setActiveComments(comments);
      } catch {
        // Keep default comments on error
      }
    }
  };

  const navigateToTopic = (topic: string) => {
    setSelectedTopic(topic);
    setCurrentView("topic-feed");
    track("flair_click", { flair: topic });
  };

  const navigateBack = () => {
    if (currentView === "post-detail" || currentView === "topic-feed") {
      setCurrentView("feed");
      setSelectedPost(null);
      setSelectedTopic(null);
      track("back_navigation", { from: currentView });
    } else if (currentView === "community-feed") {
      setCurrentView("feed");
      setSelectedCommunity(null);
      track("back_navigation", { from: "community-feed" });
    }
  };

  const navigateToCommunity = (community: PrototypeSubreddit) => {
    setSelectedCommunity(community);
    setCurrentView("community-feed");
    track("community_click", { community: community.name });
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    setIsSearchActive(text.length > 0);
    if (text.length > 0) track("search", { query: text });
  };

  const getSearchResults = () => {
    if (!searchText) return { posts: [], communities: [] };

    const query = searchText.toLowerCase();
    const matchingPosts = posts.filter(
      (post) =>
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.subreddit.toLowerCase().includes(query)
    );

    const matchingCommunities = subreddits.filter((sub) =>
      sub.name.toLowerCase().includes(query)
    );

    return {
      posts: matchingPosts.slice(0, 5),
      communities: matchingCommunities.slice(0, 3),
    };
  };

  const getFilteredPosts = () => {
    if (selectedTopic) {
      return posts.filter((post) => post.flair === selectedTopic);
    }
    return posts;
  };

  const getSortedComments = () => {
    const sortedComments = [...activeComments];

    switch (commentSort) {
      case "top":
        return sortedComments.sort((a, b) => b.upvotes - a.upvotes);
      case "new":
        return sortedComments.reverse();
      case "controversial":
        return sortedComments.sort((a, b) => {
          const aRatio = Math.abs(a.upvotes - 100);
          const bRatio = Math.abs(b.upvotes - 100);
          return aRatio - bRatio;
        });
      default:
        return sortedComments;
    }
  };

  const renderComment = (
    comment: PrototypeComment,
    isReply = false
  ): React.ReactNode => (
    <div key={comment.id} className={`comment ${isReply ? "reply" : ""}`}>
      <div className="comment-vote">
        <button
          className={`vote-btn ${
            votedComments[comment.id] === "up" ? "voted-up" : ""
          }`}
          onClick={() => handleCommentVote(comment.id, "up")}
        >
          <ChevronUp size={16} />
        </button>
        <div className="vote-line" />
        <button
          className={`vote-btn down ${
            votedComments[comment.id] === "down" ? "voted-down" : ""
          }`}
          onClick={() => handleCommentVote(comment.id, "down")}
        >
          <ChevronUp size={16} />
        </button>
      </div>
      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">{comment.author}</span>
          {comment.isOP && <span className="op-badge">OP</span>}
          <span className="comment-time">&bull; {comment.time}</span>
        </div>
        <p className="comment-text">{comment.content}</p>
        <div className="comment-actions">
          <span
            className={`comment-score ${
              votedComments[comment.id] === "up"
                ? "voted-up"
                : votedComments[comment.id] === "down"
                  ? "voted-down"
                  : ""
            }`}
          >
            {formatNumber(
              comment.upvotes +
                (votedComments[comment.id] === "up"
                  ? 1
                  : votedComments[comment.id] === "down"
                    ? -1
                    : 0)
            )}{" "}
            points
          </span>
          <button className="comment-action-btn">
            <MessageCircle size={14} />
            Reply
          </button>
          <button
            className="comment-action-btn"
            onClick={() => track("share_click", { commentId: comment.id })}
          >
            <Share2 size={14} />
            Share
          </button>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <div className="replies">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPostDetail = () => {
    if (!selectedPost) return null;

    return (
      <div className="post-detail-container">
        <div className="post-detail-card">
          <div className="post-header">
            <button className="back-icon-btn" onClick={navigateBack}>
              <ArrowLeft size={20} />
            </button>
            <div className="post-meta">
              <span className="subreddit-name">{selectedPost.subreddit}</span>
              <span className="post-time">
                &bull; {selectedPost.time.replace(" ago", "")}
              </span>
            </div>
            <button
              className="action-btn more"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal size={18} />
            </button>
          </div>

          <div className="post-content">
            <h2 className="post-title-detail">{selectedPost.title}</h2>
            <p className="post-text">{selectedPost.content}</p>
            {selectedPost.image && (
              <div className="post-image-container">
                <img
                  src={selectedPost.image}
                  alt="Post content"
                  className="post-image"
                />
              </div>
            )}
            {(vc?.showFlairs !== false) && selectedPost.flair && (
              <span
                className="post-flair"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToTopic(selectedPost.flair!);
                }}
              >
                {selectedPost.flair}
              </span>
            )}
          </div>

          <div className="post-actions">
            <div className="vote-section">
              <button
                className={`vote-btn ${
                  votedPosts[selectedPost.id] === "up" ? "voted-up" : ""
                }`}
                onClick={() => handleVote(selectedPost.id, "up")}
              >
                <ChevronUp size={20} />
              </button>
              <span
                className={`vote-count ${
                  votedPosts[selectedPost.id] === "up"
                    ? "voted-up"
                    : votedPosts[selectedPost.id] === "down"
                      ? "voted-down"
                      : ""
                }`}
              >
                {vc?.showVoteCount === false
                  ? "Vote"
                  : formatNumber(
                      selectedPost.upvotes +
                        (votedPosts[selectedPost.id] === "up"
                          ? 1
                          : votedPosts[selectedPost.id] === "down"
                            ? -1
                            : 0)
                    )}
              </span>
              <button
                className={`vote-btn down ${
                  votedPosts[selectedPost.id] === "down" ? "voted-down" : ""
                }`}
                onClick={() => handleVote(selectedPost.id, "down")}
              >
                <ChevronUp size={20} />
              </button>
            </div>

            <button className="action-btn">
              <MessageCircle size={18} />
              <span>{formatNumber(selectedPost.comments)}</span>
            </button>

            <button
              className="action-btn"
              onClick={() =>
                track("share_click", { postId: selectedPost.id })
              }
            >
              <Share2 size={18} />
            </button>

            {(vc?.showAwards !== false) && selectedPost.awards > 0 && (
              <button className="action-btn">
                <Award size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="comments-section">
          <div className="comments-header">
            <h3>Comments ({activeComments.length})</h3>
            <select
              className="comment-sort"
              value={commentSort}
              onChange={(e) => {
                setCommentSort(e.target.value);
                track("sort_change", {
                  sortType: "comments",
                  value: e.target.value,
                });
              }}
            >
              <option value="best">Best</option>
              <option value="top">Top</option>
              <option value="new">New</option>
              <option value="controversial">Controversial</option>
            </select>
          </div>

          <div className="comments-list">
            {getSortedComments().map((comment) => renderComment(comment))}
          </div>
        </div>

        <div className="sticky-comment-bar">
          <div className="comment-input-container">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="comment-input"
            />
            <button
              className="send-comment-btn"
              onClick={() => {
                if (commentText.trim()) {
                  track("comment_submit", {
                    postId: selectedPost.id,
                    length: commentText.length,
                  });
                  setCommentText("");
                }
              }}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderPostCard = (post: PrototypePost) => (
    <div
      key={post.id}
      className="post-card"
      onClick={() => navigateToPost(post)}
    >
      <div className="post-header">
        <div className="post-meta">
          <span className="subreddit-name">{post.subreddit}</span>
          <span className="post-time">
            &bull; {post.time.replace(" ago", "")}
          </span>
        </div>
        <button
          className="action-btn more"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        {(vc?.feedDensity !== "compact") && (
          <p className="post-text">{post.content}</p>
        )}
        {post.image && (
          <div className="post-image-container">
            <img src={post.image} alt="Post content" className="post-image" />
          </div>
        )}
        {(vc?.showFlairs !== false) && post.flair && (
          <span
            className="post-flair"
            onClick={(e) => {
              e.stopPropagation();
              navigateToTopic(post.flair!);
            }}
          >
            {post.flair}
          </span>
        )}
      </div>

      <div className="post-actions" onClick={(e) => e.stopPropagation()}>
        <div className="vote-section">
          <button
            className={`vote-btn ${
              votedPosts[post.id] === "up" ? "voted-up" : ""
            }`}
            onClick={() => handleVote(post.id, "up")}
          >
            <ChevronUp size={20} />
          </button>
          <span
            className={`vote-count ${
              votedPosts[post.id] === "up"
                ? "voted-up"
                : votedPosts[post.id] === "down"
                  ? "voted-down"
                  : ""
            }`}
          >
            {vc?.showVoteCount === false
              ? "Vote"
              : formatNumber(
                  post.upvotes +
                    (votedPosts[post.id] === "up"
                      ? 1
                      : votedPosts[post.id] === "down"
                        ? -1
                        : 0)
                )}
          </span>
          <button
            className={`vote-btn down ${
              votedPosts[post.id] === "down" ? "voted-down" : ""
            }`}
            onClick={() => handleVote(post.id, "down")}
          >
            <ChevronUp size={20} />
          </button>
        </div>

        <button className="action-btn">
          <MessageCircle size={18} />
          <span>{formatNumber(post.comments)}</span>
        </button>

        <button
          className="action-btn"
          onClick={() => track("share_click", { postId: post.id })}
        >
          <Share2 size={18} />
        </button>

        {(vc?.showAwards !== false) && post.awards > 0 && (
          <button className="action-btn">
            <Award size={16} />
          </button>
        )}
      </div>
    </div>
  );

  const renderHomeFeed = () => {
    return (
      <div className="feed-container">
        {currentView === "topic-feed" && (
          <div className="topic-header">
            <div className="topic-title-row">
              <button className="back-icon-btn" onClick={navigateBack}>
                <ArrowLeft size={20} />
              </button>
              <h2>Posts tagged: {selectedTopic}</h2>
            </div>
            <p>{getFilteredPosts().length} posts</p>
          </div>
        )}

        {currentView === "post-detail"
          ? renderPostDetail()
          : getFilteredPosts().map((post) => renderPostCard(post))}
      </div>
    );
  };

  const renderNotifications = () => (
    <div className="notifications-container">
      <h2 className="page-title">Notifications</h2>
      {DEFAULT_NOTIFICATIONS.map((notif) => (
        <div
          key={notif.id}
          className={`notification-item ${notif.unread ? "unread" : ""}`}
        >
          <div className={`notif-icon ${notif.type}`}>
            {notif.type === "upvote" && <ChevronUp size={20} />}
            {notif.type === "comment" && <MessageCircle size={20} />}
            {notif.type === "award" && <Award size={20} />}
            {notif.type === "trending" && <TrendingUp size={20} />}
          </div>
          <div className="notif-content">
            <p className="notif-message">{notif.message}</p>
            <span className="notif-time">{notif.time}</span>
          </div>
          {notif.unread && <div className="unread-dot" />}
        </div>
      ))}
    </div>
  );

  const renderProfile = () => (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <User size={48} />
        </div>
        <h2 className="profile-name">u/YourUsername</h2>
        <p className="profile-karma">
          <span className="karma-item">
            <ChevronUp size={16} />
            42.5k karma
          </span>
          <span className="karma-divider">&bull;</span>
          <span className="karma-item">3y on Reddit</span>
        </p>
      </div>

      <div className="profile-stats">
        <div className="stat-item">
          <div className="stat-value">156</div>
          <div className="stat-label">Posts</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">2.4k</div>
          <div className="stat-label">Comments</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">28</div>
          <div className="stat-label">Awards</div>
        </div>
      </div>

      <div className="profile-sections">
        <button
          className="profile-section-btn"
          onClick={() => track("bookmark_click")}
        >
          <Bookmark size={20} />
          <span>Saved Posts</span>
        </button>
        <button className="profile-section-btn">
          <Eye size={20} />
          <span>History</span>
        </button>
        <button className="profile-section-btn">
          <Award size={20} />
          <span>Achievements</span>
        </button>
      </div>
    </div>
  );

  const renderSearch = () => {
    const results = getSearchResults();

    return (
      <div className="search-results-container">
        {results.communities.length > 0 && (
          <div className="search-section">
            <h3 className="search-section-title">Communities</h3>
            {results.communities.map((sub, index) => (
              <div
                key={index}
                className="search-result-item"
                onClick={() => {
                  navigateToCommunity(sub);
                  setSearchText("");
                  setIsSearchActive(false);
                }}
              >
                <div
                  className="subreddit-icon"
                  style={{ backgroundColor: sub.color }}
                >
                  <span>{sub.icon}</span>
                </div>
                <div className="search-result-info">
                  <div className="search-result-name">{sub.name}</div>
                  <div className="search-result-meta">
                    {sub.members} members
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.posts.length > 0 && (
          <div className="search-section">
            <h3 className="search-section-title">Posts</h3>
            {results.posts.map((post) => (
              <div
                key={post.id}
                className="search-result-item"
                onClick={() => {
                  navigateToPost(post);
                  setSearchText("");
                  setIsSearchActive(false);
                }}
              >
                <div className="search-result-info">
                  <div className="search-result-name">{post.title}</div>
                  <div className="search-result-meta">
                    {post.subreddit} &bull; {formatNumber(post.upvotes)}{" "}
                    upvotes
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {results.communities.length === 0 &&
          results.posts.length === 0 && (
            <div className="no-results">
              <p>No results found for &ldquo;{searchText}&rdquo;</p>
            </div>
          )}
      </div>
    );
  };

  const renderCreateSheet = () => (
    <div className={`bottom-sheet ${showCreateSheet ? "show" : ""}`}>
      <div
        className="bottom-sheet-backdrop"
        onClick={() => {
          setShowCreateSheet(false);
          track("create_post_close");
        }}
      />
      <div className="bottom-sheet-content">
        <div className="bottom-sheet-handle" />
        <div className="bottom-sheet-header">
          <h2>Create a post</h2>
          <button
            className="close-sheet"
            onClick={() => {
              setShowCreateSheet(false);
              track("create_post_close");
            }}
          >
            &times;
          </button>
        </div>

        <div className="create-options">
          <button className="create-option">
            <MessageCircle size={24} />
            <span>Text Post</span>
          </button>
          <button className="create-option">
            <div className="icon-placeholder">📷</div>
            <span>Image Post</span>
          </button>
          <button className="create-option">
            <div className="icon-placeholder">🔗</div>
            <span>Link Post</span>
          </button>
          <button className="create-option">
            <div className="icon-placeholder">🎥</div>
            <span>Video Post</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderCommunities = () => {
    if (currentView === "community-feed" && selectedCommunity) {
      const communityPosts = posts.filter(
        (post) => post.subreddit === selectedCommunity.name
      );

      return (
        <div className="feed-container">
          <div className="community-header">
            <div className="community-title-row">
              <button className="back-icon-btn" onClick={navigateBack}>
                <ArrowLeft size={20} />
              </button>
              <div
                className="community-icon-large"
                style={{ backgroundColor: selectedCommunity.color }}
              >
                <span>{selectedCommunity.icon}</span>
              </div>
            </div>
            <h2>{selectedCommunity.name}</h2>
            <p>{selectedCommunity.members} members</p>
            <button className="join-btn-large">Join Community</button>
          </div>

          {communityPosts.map((post) => renderPostCard(post))}
        </div>
      );
    }

    const filteredSubreddits = subreddits.filter((sub) =>
      sub.name.toLowerCase().includes(subredditSearch.toLowerCase())
    );

    return (
      <div className="communities-container">
        <div className="search-container-inline">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search communities..."
            value={subredditSearch}
            onChange={(e) => setSubredditSearch(e.target.value)}
          />
        </div>
        <div className="subreddit-list-inline">
          {filteredSubreddits.map((sub, index) => (
            <div
              key={index}
              className="subreddit-item clickable"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => navigateToCommunity(sub)}
            >
              <div
                className="subreddit-icon"
                style={{ backgroundColor: sub.color }}
              >
                <span>{sub.icon}</span>
              </div>
              <div className="subreddit-info">
                <div className="subreddit-name">{sub.name}</div>
                <div className="subreddit-members">
                  {sub.members} members
                </div>
              </div>
              <button className="chevron-btn">
                <ChevronUp
                  size={18}
                  style={{ transform: "rotate(90deg)" }}
                />
              </button>
            </div>
          ))}
          {filteredSubreddits.length === 0 && (
            <div className="no-results">
              <p>No communities found</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSubredditMenu = () => {
    const filteredSubreddits = subreddits.filter((sub) =>
      sub.name.toLowerCase().includes(subredditSearch.toLowerCase())
    );

    return (
      <div
        className={`subreddit-menu ${showSubredditMenu ? "show" : ""}`}
      >
        <div className="menu-header">
          <h2>Communities</h2>
          <button
            className="close-menu"
            onClick={() => setShowSubredditMenu(false)}
          >
            &times;
          </button>
        </div>
        <div className="search-container">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search communities..."
            value={subredditSearch}
            onChange={(e) => setSubredditSearch(e.target.value)}
          />
        </div>
        <div className="subreddit-list">
          {filteredSubreddits.map((sub, index) => (
            <div
              key={index}
              className="subreddit-item"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div
                className="subreddit-icon"
                style={{ backgroundColor: sub.color }}
              >
                <span>{sub.icon}</span>
              </div>
              <div className="subreddit-info">
                <div className="subreddit-name">{sub.name}</div>
                <div className="subreddit-members">
                  {sub.members} members
                </div>
              </div>
              <button className="join-btn">Join</button>
            </div>
          ))}
          {filteredSubreddits.length === 0 && (
            <div className="no-results">
              <p>No communities found</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="reddit-mobile-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Reddit+Sans:wght@400;600;700&display=swap');

        .reddit-mobile-wrapper {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .reddit-mobile-wrapper .reddit-mobile {
          font-family: 'Reddit Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          width: 100%;
          height: 100%;
          background: var(--reddit-bg-canvas);
          color: var(--reddit-text-primary);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          border-radius: 32px;
        }

        .reddit-mobile-wrapper .top-bar {
          background: var(--reddit-bg-surface);
          padding: 48px 16px 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-bottom: 1px solid var(--reddit-border);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .reddit-mobile-wrapper .search-field-container {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--reddit-bg-elevated);
          border: 1px solid var(--reddit-border);
          padding: 8px 12px;
          border-radius: 20px;
        }

        .reddit-mobile-wrapper .search-icon {
          color: var(--reddit-text-secondary);
          flex-shrink: 0;
        }

        .reddit-mobile-wrapper .search-field {
          flex: 1;
          background: none;
          border: none;
          color: var(--reddit-text-primary);
          font-size: 0.875rem;
          line-height: 1.375rem;
          font-weight: 400;
          letter-spacing: -0.0125rem;
          outline: none;
          font-family: 'Reddit Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .reddit-mobile-wrapper .search-field::placeholder {
          color: var(--reddit-text-secondary);
        }

        .reddit-mobile-wrapper .create-btn {
          background: var(--reddit-bg-elevated);
          border: 1px solid var(--reddit-border);
          color: var(--reddit-text-secondary);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 400;
          line-height: 1;
          transition: all 150ms ease;
          flex-shrink: 0;
        }

        .reddit-mobile-wrapper .create-btn:hover {
          background: var(--reddit-bg-hover);
        }

        .reddit-mobile-wrapper .create-btn:active {
          transform: scale(0.95);
        }

        .reddit-mobile-wrapper .content-area {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding-bottom: 70px;
          background: var(--reddit-bg-canvas);
        }

        .reddit-mobile-wrapper .content-area::-webkit-scrollbar {
          width: 6px;
        }

        .reddit-mobile-wrapper .content-area::-webkit-scrollbar-track {
          background: transparent;
        }

        .reddit-mobile-wrapper .content-area::-webkit-scrollbar-thumb {
          background: var(--reddit-scrollbar-thumb);
          border-radius: 3px;
        }

        .reddit-mobile-wrapper .feed-container {
          animation: redditFadeIn 300ms ease;
        }

        @keyframes redditFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .reddit-mobile-wrapper .topic-header {
          padding: 16px;
          background: var(--reddit-bg-surface);
          border-bottom: 1px solid var(--reddit-border);
        }

        .reddit-mobile-wrapper .topic-header h2 {
          font-size: 1.25rem;
          line-height: 1.625rem;
          font-weight: 700;
          letter-spacing: -0.03125rem;
          color: var(--reddit-orange);
          margin-bottom: 4px;
        }

        .reddit-mobile-wrapper .topic-header p {
          font-size: 0.8125rem;
          line-height: 1.125rem;
          font-weight: 400;
          color: var(--reddit-text-secondary);
        }

        .reddit-mobile-wrapper .topic-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .reddit-mobile-wrapper .topic-title-row h2 {
          margin: 0;
        }

        .reddit-mobile-wrapper .community-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .reddit-mobile-wrapper .community-title-row .community-icon-large {
          margin: 0;
        }

        .reddit-mobile-wrapper .post-card {
          background: var(--reddit-bg-surface);
          margin: 0;
          border-radius: 0;
          border-bottom: 1px solid var(--reddit-border);
          padding: 8px 16px;
          cursor: pointer;
          transition: background 150ms ease;
        }

        .reddit-mobile-wrapper .post-card:hover {
          background: var(--reddit-bg-elevated);
        }

        .reddit-mobile-wrapper .post-header {
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .reddit-mobile-wrapper .back-icon-btn {
          background: var(--reddit-bg-elevated);
          border: 1px solid var(--reddit-border);
          color: var(--reddit-text-secondary);
          padding: 6px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 150ms ease;
          margin-right: 8px;
          flex-shrink: 0;
        }

        .reddit-mobile-wrapper .back-icon-btn:hover {
          background: var(--reddit-bg-hover);
        }

        .reddit-mobile-wrapper .back-icon-btn:active {
          transform: scale(0.95);
        }

        .reddit-mobile-wrapper .post-meta {
          font-size: 0.75rem;
          line-height: 1rem;
          font-weight: 400;
          color: var(--reddit-text-secondary);
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
        }

        .reddit-mobile-wrapper .subreddit-name {
          color: var(--reddit-text-primary);
          font-weight: 700;
        }

        .reddit-mobile-wrapper .post-content {
          margin-bottom: 6px;
        }

        .reddit-mobile-wrapper .post-title {
          font-size: 1rem;
          line-height: 1.5rem;
          font-weight: 600;
          letter-spacing: -0.01875rem;
          margin-bottom: 4px;
          color: var(--reddit-text-primary);
        }

        .reddit-mobile-wrapper .post-title-detail {
          font-size: 1.25rem;
          line-height: 1.625rem;
          font-weight: 700;
          letter-spacing: -0.03125rem;
          margin-bottom: 12px;
          color: var(--reddit-text-primary);
        }

        .reddit-mobile-wrapper .post-flair {
          display: inline-block;
          background: transparent;
          color: var(--reddit-text-secondary);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          line-height: 1rem;
          font-weight: 600;
          letter-spacing: 0.00625rem;
          text-transform: uppercase;
          margin-top: 8px;
          margin-bottom: 0;
          border: 1px solid var(--reddit-border-strong);
          cursor: pointer;
          transition: all 150ms ease;
        }

        .reddit-mobile-wrapper .post-flair:hover {
          background: var(--reddit-bg-elevated);
          border-color: var(--reddit-border-strong);
        }

        .reddit-mobile-wrapper .post-text {
          font-size: 0.875rem;
          line-height: 1.375rem;
          font-weight: 400;
          letter-spacing: -0.0125rem;
          color: var(--reddit-text-primary);
          margin-bottom: 6px;
        }

        .reddit-mobile-wrapper .post-image-container {
          border-radius: 8px;
          overflow: hidden;
          margin-top: 6px;
          border: 1px solid var(--reddit-border);
        }

        .reddit-mobile-wrapper .post-image {
          width: 100%;
          height: auto;
          display: block;
        }

        .reddit-mobile-wrapper .post-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          padding-top: 4px;
        }

        .reddit-mobile-wrapper .vote-section {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          padding: 4px 8px;
          border-radius: 16px;
        }

        .reddit-mobile-wrapper .vote-btn {
          background: none;
          border: none;
          color: var(--reddit-text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 150ms ease;
          padding: 4px;
        }

        .reddit-mobile-wrapper .vote-btn.down {
          transform: rotate(180deg);
        }

        .reddit-mobile-wrapper .vote-btn.voted-up {
          color: var(--reddit-orange);
        }

        .reddit-mobile-wrapper .vote-btn.voted-down {
          color: var(--reddit-periwinkle);
        }

        .reddit-mobile-wrapper .vote-btn:hover {
          transform: scale(1.2);
        }

        .reddit-mobile-wrapper .vote-btn.down:hover {
          transform: rotate(180deg) scale(1.2);
        }

        .reddit-mobile-wrapper .vote-count {
          font-weight: 700;
          font-size: 0.8125rem;
          line-height: 1rem;
          color: var(--reddit-text-primary);
          min-width: 35px;
          text-align: center;
        }

        .reddit-mobile-wrapper .vote-count.voted-up {
          color: var(--reddit-orange);
        }

        .reddit-mobile-wrapper .vote-count.voted-down {
          color: var(--reddit-periwinkle);
        }

        .reddit-mobile-wrapper .action-btn {
          background: none;
          border: none;
          color: var(--reddit-text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          line-height: 1rem;
          font-weight: 600;
          padding: 6px 8px;
          border-radius: 8px;
          transition: all 150ms ease;
        }

        .reddit-mobile-wrapper .action-btn:hover {
          background: var(--reddit-bg-elevated);
          color: var(--reddit-text-primary);
        }

        .reddit-mobile-wrapper .action-btn.more {
          padding: 6px;
        }

        .reddit-mobile-wrapper .post-detail-container {
          background: var(--reddit-bg-canvas);
        }

        .reddit-mobile-wrapper .post-detail-card {
          background: var(--reddit-bg-surface);
          border-bottom: 4px solid var(--reddit-border);
          padding: 16px;
        }

        .reddit-mobile-wrapper .comments-section {
          padding: 16px;
          padding-bottom: 80px;
          background: var(--reddit-bg-surface);
        }

        .reddit-mobile-wrapper .comments-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--reddit-border);
        }

        .reddit-mobile-wrapper .comments-header h3 {
          font-size: 1rem;
          line-height: 1.5rem;
          font-weight: 600;
          color: var(--reddit-text-primary);
        }

        .reddit-mobile-wrapper .comment-sort {
          background: var(--reddit-bg-elevated);
          border: 1px solid var(--reddit-border);
          color: var(--reddit-text-primary);
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
        }

        .reddit-mobile-wrapper .comment-input-container {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--reddit-bg-elevated);
          padding: 8px 12px;
          border-radius: 20px;
          border: 1px solid var(--reddit-border);
        }

        .reddit-mobile-wrapper .comment-input {
          flex: 1;
          background: none;
          border: none;
          color: var(--reddit-text-primary);
          font-size: 0.875rem;
          line-height: 1.375rem;
          font-weight: 400;
          outline: none;
          font-family: 'Reddit Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .reddit-mobile-wrapper .comment-input::placeholder {
          color: var(--reddit-text-secondary);
        }

        .reddit-mobile-wrapper .send-comment-btn {
          background: var(--reddit-text-secondary);
          border: none;
          color: white;
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 150ms ease;
        }

        .reddit-mobile-wrapper .send-comment-btn:hover {
          background: var(--reddit-border-strong);
        }

        .reddit-mobile-wrapper .sticky-comment-bar {
          position: sticky;
          bottom: 7px;
          left: 0;
          right: 0;
          background: var(--reddit-bg-surface);
          padding: 12px 16px;
          border-top: 1px solid var(--reddit-border);
          z-index: 50;
        }

        .reddit-mobile-wrapper .comments-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .reddit-mobile-wrapper .comment {
          display: flex;
          gap: 8px;
        }

        .reddit-mobile-wrapper .comment.reply {
          margin-left: 32px;
        }

        .reddit-mobile-wrapper .comment-vote {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 4px;
          gap: 4px;
        }

        .reddit-mobile-wrapper .vote-line {
          width: 2px;
          flex: 1;
          background: var(--reddit-border);
          min-height: 20px;
        }

        .reddit-mobile-wrapper .comment-content {
          flex: 1;
        }

        .reddit-mobile-wrapper .comment-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }

        .reddit-mobile-wrapper .comment-author {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--reddit-text-primary);
        }

        .reddit-mobile-wrapper .op-badge {
          background: var(--reddit-orange);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .reddit-mobile-wrapper .comment-time {
          font-size: 0.75rem;
          color: var(--reddit-text-secondary);
        }

        .reddit-mobile-wrapper .comment-text {
          font-size: 0.875rem;
          line-height: 1.375rem;
          color: var(--reddit-text-primary);
          margin-bottom: 8px;
        }

        .reddit-mobile-wrapper .comment-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .reddit-mobile-wrapper .comment-score {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--reddit-text-secondary);
        }

        .reddit-mobile-wrapper .comment-score.voted-up {
          color: var(--reddit-orange);
        }

        .reddit-mobile-wrapper .comment-score.voted-down {
          color: var(--reddit-periwinkle);
        }

        .reddit-mobile-wrapper .comment-action-btn {
          background: none;
          border: none;
          color: var(--reddit-text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 8px;
          transition: all 150ms ease;
        }

        .reddit-mobile-wrapper .comment-action-btn:hover {
          background: var(--reddit-bg-elevated);
          color: var(--reddit-text-primary);
        }

        .reddit-mobile-wrapper .replies {
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .reddit-mobile-wrapper .notifications-container,
        .reddit-mobile-wrapper .profile-container {
          padding: 20px 16px;
          animation: redditFadeIn 300ms ease;
        }

        .reddit-mobile-wrapper .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 24px;
          color: var(--reddit-orange);
        }

        .reddit-mobile-wrapper .notification-item {
          background: var(--reddit-bg-surface);
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 10px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border: 1px solid var(--reddit-border);
          position: relative;
          transition: all 150ms ease;
        }

        .reddit-mobile-wrapper .notification-item.unread {
          background: var(--reddit-notif-upvote-bg);
          border-color: var(--reddit-notif-upvote-border);
        }

        .reddit-mobile-wrapper .notification-item:hover {
          background: var(--reddit-bg-elevated);
        }

        .reddit-mobile-wrapper .notif-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .reddit-mobile-wrapper .notif-icon.upvote {
          background: var(--reddit-notif-upvote-bg);
          color: var(--reddit-orange);
        }

        .reddit-mobile-wrapper .notif-icon.comment {
          background: var(--reddit-notif-comment-bg);
          color: var(--reddit-periwinkle);
        }

        .reddit-mobile-wrapper .notif-icon.award {
          background: var(--reddit-notif-award-bg);
          color: var(--reddit-gold);
        }

        .reddit-mobile-wrapper .notif-icon.trending {
          background: var(--reddit-notif-trending-bg);
          color: var(--reddit-green);
        }

        .reddit-mobile-wrapper .notif-content {
          flex: 1;
        }

        .reddit-mobile-wrapper .notif-message {
          font-size: 0.875rem;
          color: var(--reddit-text-primary);
          margin-bottom: 4px;
        }

        .reddit-mobile-wrapper .notif-time {
          font-size: 0.75rem;
          color: var(--reddit-text-secondary);
        }

        .reddit-mobile-wrapper .unread-dot {
          width: 8px;
          height: 8px;
          background: var(--reddit-orange);
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 6px;
        }

        .reddit-mobile-wrapper .profile-header {
          text-align: center;
          padding: 20px 0;
          border-bottom: 1px solid var(--reddit-border);
          margin-bottom: 20px;
        }

        .reddit-mobile-wrapper .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--reddit-orange);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
          color: white;
          border: 3px solid var(--reddit-border);
        }

        .reddit-mobile-wrapper .profile-name {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--reddit-text-primary);
        }

        .reddit-mobile-wrapper .profile-karma {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--reddit-text-secondary);
          font-size: 0.8125rem;
        }

        .reddit-mobile-wrapper .karma-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .reddit-mobile-wrapper .karma-divider {
          color: var(--reddit-border);
        }

        .reddit-mobile-wrapper .profile-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .reddit-mobile-wrapper .stat-item {
          background: var(--reddit-bg-surface);
          padding: 16px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid var(--reddit-border);
          transition: all 150ms ease;
        }

        .reddit-mobile-wrapper .stat-item:hover {
          background: var(--reddit-bg-elevated);
          border-color: var(--reddit-orange);
        }

        .reddit-mobile-wrapper .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--reddit-orange);
          margin-bottom: 4px;
        }

        .reddit-mobile-wrapper .stat-label {
          font-size: 0.75rem;
          color: var(--reddit-text-secondary);
          font-weight: 600;
        }

        .reddit-mobile-wrapper .profile-sections {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .reddit-mobile-wrapper .profile-section-btn {
          background: var(--reddit-bg-surface);
          border: 1px solid var(--reddit-border);
          color: var(--reddit-text-primary);
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 0.9375rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 150ms ease;
        }

        .reddit-mobile-wrapper .profile-section-btn:hover {
          background: var(--reddit-bg-elevated);
          border-color: var(--reddit-orange);
        }

        .reddit-mobile-wrapper .subreddit-menu {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: var(--reddit-bg-canvas);
          z-index: 200;
          transform: translateX(-100%);
          transition: transform 300ms ease;
          display: flex;
          flex-direction: column;
          border-radius: 32px;
        }

        .reddit-mobile-wrapper .subreddit-menu.show {
          transform: translateX(0);
        }

        .reddit-mobile-wrapper .menu-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 48px 16px 16px 16px;
          border-bottom: 1px solid var(--reddit-border);
          background: var(--reddit-bg-surface);
        }

        .reddit-mobile-wrapper .menu-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--reddit-orange);
        }

        .reddit-mobile-wrapper .close-menu {
          background: none;
          border: none;
          color: var(--reddit-text-primary);
          font-size: 32px;
          cursor: pointer;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 150ms ease;
        }

        .reddit-mobile-wrapper .close-menu:hover {
          background: var(--reddit-bg-elevated);
        }

        .reddit-mobile-wrapper .search-container {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--reddit-bg-surface);
          border-bottom: 1px solid var(--reddit-border);
          color: var(--reddit-text-secondary);
        }

        .reddit-mobile-wrapper .search-container input {
          flex: 1;
          background: var(--reddit-bg-elevated);
          border: 1px solid var(--reddit-border);
          padding: 10px 14px;
          border-radius: 20px;
          color: var(--reddit-text-primary);
          font-size: 0.875rem;
          outline: none;
          font-family: 'Reddit Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .reddit-mobile-wrapper .search-container input::placeholder {
          color: var(--reddit-text-secondary);
        }

        .reddit-mobile-wrapper .subreddit-list {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        .reddit-mobile-wrapper .subreddit-list::-webkit-scrollbar {
          width: 6px;
        }

        .reddit-mobile-wrapper .subreddit-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .reddit-mobile-wrapper .subreddit-list::-webkit-scrollbar-thumb {
          background: var(--reddit-scrollbar-thumb);
          border-radius: 3px;
        }

        .reddit-mobile-wrapper .subreddit-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--reddit-bg-surface);
          border: 1px solid var(--reddit-border);
          border-radius: 12px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 150ms ease;
          animation: redditSlideIn 300ms ease both;
        }

        @keyframes redditSlideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .reddit-mobile-wrapper .subreddit-item:hover {
          background: var(--reddit-bg-elevated);
          border-color: var(--reddit-orange);
        }

        .reddit-mobile-wrapper .subreddit-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .reddit-mobile-wrapper .subreddit-info {
          flex: 1;
        }

        .reddit-mobile-wrapper .subreddit-name {
          font-weight: 700;
          font-size: 0.875rem;
          color: var(--reddit-text-primary);
          margin-bottom: 2px;
        }

        .reddit-mobile-wrapper .subreddit-members {
          font-size: 0.75rem;
          color: var(--reddit-text-secondary);
        }

        .reddit-mobile-wrapper .join-btn {
          background: var(--reddit-orange);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 16px;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .reddit-mobile-wrapper .join-btn:hover {
          background: var(--reddit-orange-hover);
        }

        .reddit-mobile-wrapper .no-results {
          text-align: center;
          padding: 40px 20px;
          color: var(--reddit-text-secondary);
        }

        .reddit-mobile-wrapper .no-results p {
          font-size: 0.875rem;
        }

        .reddit-mobile-wrapper .communities-container {
          padding: 16px;
          animation: redditFadeIn 300ms ease;
        }

        .reddit-mobile-wrapper .search-container-inline {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--reddit-bg-surface);
          border: 1px solid var(--reddit-border);
          border-radius: 20px;
          margin-bottom: 16px;
          color: var(--reddit-text-secondary);
        }

        .reddit-mobile-wrapper .search-container-inline input {
          flex: 1;
          background: none;
          border: none;
          color: var(--reddit-text-primary);
          font-size: 0.875rem;
          outline: none;
          font-family: 'Reddit Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .reddit-mobile-wrapper .search-container-inline input::placeholder {
          color: var(--reddit-text-secondary);
        }

        .reddit-mobile-wrapper .subreddit-list-inline {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .reddit-mobile-wrapper .subreddit-item.clickable {
          cursor: pointer;
        }

        .reddit-mobile-wrapper .chevron-btn {
          background: none;
          border: none;
          color: var(--reddit-text-secondary);
          padding: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 150ms ease;
        }

        .reddit-mobile-wrapper .chevron-btn:hover {
          color: var(--reddit-text-primary);
        }

        .reddit-mobile-wrapper .bottom-sheet {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 300;
          pointer-events: none;
          opacity: 0;
          transition: opacity 300ms ease;
          border-radius: 32px;
          overflow: hidden;
        }

        .reddit-mobile-wrapper .bottom-sheet.show {
          pointer-events: auto;
          opacity: 1;
        }

        .reddit-mobile-wrapper .bottom-sheet-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 32px;
        }

        .reddit-mobile-wrapper .bottom-sheet-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--reddit-bg-surface);
          border-radius: 32px 32px 0 0;
          padding: 20px;
          transform: translateY(100%);
          transition: transform 300ms ease;
          max-height: 60vh;
        }

        .reddit-mobile-wrapper .bottom-sheet.show .bottom-sheet-content {
          transform: translateY(0);
        }

        .reddit-mobile-wrapper .bottom-sheet-handle {
          width: 40px;
          height: 4px;
          background: var(--reddit-border);
          border-radius: 2px;
          margin: 0 auto 20px;
        }

        .reddit-mobile-wrapper .bottom-sheet-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .reddit-mobile-wrapper .bottom-sheet-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--reddit-text-primary);
        }

        .reddit-mobile-wrapper .close-sheet {
          background: none;
          border: none;
          color: var(--reddit-text-secondary);
          font-size: 32px;
          cursor: pointer;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 150ms ease;
        }

        .reddit-mobile-wrapper .close-sheet:hover {
          background: var(--reddit-bg-elevated);
        }

        .reddit-mobile-wrapper .create-options {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .reddit-mobile-wrapper .create-option {
          background: var(--reddit-bg-elevated);
          border: 1px solid var(--reddit-border);
          padding: 20px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transition: all 150ms ease;
          color: var(--reddit-text-primary);
        }

        .reddit-mobile-wrapper .create-option:hover {
          background: var(--reddit-bg-hover);
          border-color: var(--reddit-orange);
        }

        .reddit-mobile-wrapper .create-option span {
          font-size: 0.875rem;
          font-weight: 600;
        }

        .reddit-mobile-wrapper .icon-placeholder {
          font-size: 24px;
        }

        .reddit-mobile-wrapper .search-results-container {
          padding: 16px;
          animation: redditFadeIn 300ms ease;
        }

        .reddit-mobile-wrapper .search-section {
          margin-bottom: 24px;
        }

        .reddit-mobile-wrapper .search-section-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: var(--reddit-text-secondary);
          margin-bottom: 12px;
        }

        .reddit-mobile-wrapper .search-result-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: var(--reddit-bg-surface);
          border: 1px solid var(--reddit-border);
          border-radius: 12px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .reddit-mobile-wrapper .search-result-item:hover {
          background: var(--reddit-bg-elevated);
          border-color: var(--reddit-orange);
        }

        .reddit-mobile-wrapper .search-result-info {
          flex: 1;
          min-width: 0;
        }

        .reddit-mobile-wrapper .search-result-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--reddit-text-primary);
          margin-bottom: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .reddit-mobile-wrapper .search-result-meta {
          font-size: 0.75rem;
          color: var(--reddit-text-secondary);
        }

        .reddit-mobile-wrapper .community-header {
          background: var(--reddit-bg-surface);
          padding: 24px 16px;
          text-align: center;
          border-bottom: 1px solid var(--reddit-border);
        }

        .reddit-mobile-wrapper .community-icon-large {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          margin: 0 auto 16px;
        }

        .reddit-mobile-wrapper .community-header h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--reddit-text-primary);
          margin-bottom: 4px;
        }

        .reddit-mobile-wrapper .community-header p {
          font-size: 0.8125rem;
          color: var(--reddit-text-secondary);
          margin-bottom: 16px;
        }

        .reddit-mobile-wrapper .join-btn-large {
          background: var(--reddit-orange);
          border: none;
          color: white;
          padding: 10px 24px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .reddit-mobile-wrapper .join-btn-large:hover {
          background: var(--reddit-orange-hover);
        }

        .reddit-mobile-wrapper .bottom-nav {
          background: var(--reddit-bg-surface);
          border-top: 1px solid var(--reddit-border);
          padding: 8px 0 12px 0;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          z-index: 100;
          border-radius: 0 0 32px 32px;
        }

        .reddit-mobile-wrapper .nav-item {
          background: none;
          border: none;
          color: var(--reddit-text-secondary);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          transition: all 150ms ease;
          position: relative;
        }

        .reddit-mobile-wrapper .nav-item:hover {
          color: var(--reddit-text-primary);
        }

        .reddit-mobile-wrapper .nav-item.active {
          color: var(--reddit-orange);
        }

        .reddit-mobile-wrapper .nav-item.active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 32px;
          height: 3px;
          background: var(--reddit-orange);
          border-radius: 0 0 3px 3px;
        }

        .reddit-mobile-wrapper .nav-label {
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
        }
      `}</style>

      <div className="reddit-mobile">
        <div className="top-bar">
          <div className="search-field-container">
            <div className="reddit-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="10" cy="10" r="10" fill="var(--reddit-orange)" />
                <circle cx="7" cy="9" r="1.5" fill="white" />
                <circle cx="13" cy="9" r="1.5" fill="white" />
                <path
                  d="M6.5 12C6.5 12 7.5 14 10 14C12.5 14 13.5 12 13.5 12"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search Reddit"
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="search-field"
            />
          </div>
          <button
            className="create-btn"
            onClick={() => {
              setShowCreateSheet(true);
              track("create_post_open");
            }}
          >
            <span>+</span>
          </button>
        </div>

        <div className="content-area">
          {isSearchActive ? (
            renderSearch()
          ) : (
            <>
              {activeTab === "home" && renderHomeFeed()}
              {activeTab === "communities" && renderCommunities()}
              {activeTab === "notifications" && renderNotifications()}
              {activeTab === "profile" && renderProfile()}
            </>
          )}
        </div>

        {renderSubredditMenu()}
        {renderCreateSheet()}

        <div className="bottom-nav">
          <button
            className={`nav-item ${activeTab === "home" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("home");
              setCurrentView("feed");
              setIsSearchActive(false);
              setSearchText("");
              track("tab_switch", { tab: "home" });
            }}
          >
            <Home size={24} />
            <span className="nav-label">Home</span>
          </button>
          <button
            className={`nav-item ${activeTab === "communities" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("communities");
              setIsSearchActive(false);
              setSearchText("");
              track("tab_switch", { tab: "communities" });
            }}
          >
            <Menu size={24} />
            <span className="nav-label">Communities</span>
          </button>
          <button
            className={`nav-item ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("notifications");
              setIsSearchActive(false);
              setSearchText("");
              track("tab_switch", { tab: "notifications" });
            }}
          >
            <Bell size={24} />
            <span className="nav-label">Inbox</span>
          </button>
          <button
            className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("profile");
              setIsSearchActive(false);
              setSearchText("");
              track("tab_switch", { tab: "profile" });
            }}
          >
            <User size={24} />
            <span className="nav-label">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RedditMobile;
