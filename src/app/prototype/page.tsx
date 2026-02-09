"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import RedditMobile from "@/components/prototype/RedditMobile";
import { useTracking } from "@/hooks/useTracking";
import { mapRedditPost, mapRedditComment, mapRedditSubreddit } from "@/lib/reddit-mapper";
import { VARIANT_PRESETS, type VariantConfig } from "@/lib/variants";
import type { PrototypePost, PrototypeComment, PrototypeSubreddit } from "@/lib/types/prototype";

const prototypeStyles = `
  .prototype-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: var(--reddit-bg-canvas, #DAE0E6);
    padding: 40px 20px;
  }
  .prototype-frame {
    width: 100%;
    max-width: var(--reddit-frame-width, 390px);
    height: var(--reddit-frame-height, 844px);
    background: var(--reddit-frame-bg, #000);
    border-radius: var(--reddit-radius-device, 40px);
    padding: 12px;
    box-shadow: var(--reddit-shadow-device);
    position: relative;
    overflow: hidden;
  }
  .prototype-notch {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: var(--reddit-notch-width, 150px);
    height: var(--reddit-notch-height, 28px);
    background: var(--reddit-frame-bg, #000);
    border-radius: 0 0 20px 20px;
    z-index: 1000;
  }
  .variant-badge {
    position: fixed;
    top: 12px;
    right: 12px;
    background: rgba(0,0,0,0.7);
    color: #fff;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 600;
    z-index: 9999;
    pointer-events: none;
  }
  .proto-toolbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9998;
  }
  .proto-toolbar-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: #18181b;
    border-bottom: 1px solid #27272a;
  }
  .proto-toolbar-back {
    color: #a1a1aa;
    font-size: 13px;
    text-decoration: none;
    padding: 4px 8px;
    border-radius: 6px;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .proto-toolbar-back:hover { color: #fff; background: #27272a; }
  .proto-toolbar-title {
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .proto-toolbar-toggle {
    color: #a1a1aa;
    background: none;
    border: 1px solid #3f3f46;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .proto-toolbar-toggle:hover { color: #fff; border-color: #52525b; background: #27272a; }
  .proto-toolbar-menu {
    background: #18181b;
    border-bottom: 1px solid #27272a;
    padding: 8px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 6px;
  }
  .proto-toolbar-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    text-decoration: none;
    font-size: 12px;
    font-weight: 500;
    color: #a1a1aa;
    transition: all 0.15s;
    border: 1px solid transparent;
  }
  .proto-toolbar-item:hover { color: #fff; background: #27272a; }
  .proto-toolbar-item[data-active="true"] {
    color: #fb923c;
    background: rgba(251,146,60,0.08);
    border-color: rgba(251,146,60,0.2);
  }
  .proto-toolbar-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .proto-toolbar-spacer {
    height: 44px;
  }
`;

const VARIANT_DOT_COLORS: Record<string, string> = {
  default: "#71717a",
  "variant-a": "#3b82f6",
  "variant-b": "#22c55e",
  "variant-c": "#a855f7",
};

function PrototypeToolbar({
  currentVariant,
  isParticipant,
}: {
  currentVariant?: VariantConfig;
  isParticipant: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  if (isParticipant) return null;

  const variants = Object.values(VARIANT_PRESETS);
  const currentLabel = currentVariant?.label || "Default";

  return (
    <div className="proto-toolbar">
      <div className="proto-toolbar-bar">
        <Link href="/prototypes" className="proto-toolbar-back">
          &larr; Back
        </Link>
        <span className="proto-toolbar-title">
          Viewing: {currentLabel}
        </span>
        <button
          className="proto-toolbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "Close" : "All Prototypes"}
        </button>
      </div>
      {menuOpen && (
        <div className="proto-toolbar-menu">
          {variants.map((v) => {
            const isActive = (currentVariant?.id || "default") === v.id;
            return (
              <a
                key={v.id}
                href={v.id === "default" ? "/prototype" : `/prototype?variant=${v.id}`}
                className="proto-toolbar-item"
                data-active={isActive}
                onClick={(e) => {
                  e.preventDefault();
                  setMenuOpen(false);
                  const url = v.id === "default" ? "/prototype" : `/prototype?variant=${v.id}`;
                  router.push(url);
                }}
              >
                <span
                  className="proto-toolbar-dot"
                  style={{ background: VARIANT_DOT_COLORS[v.id] || VARIANT_DOT_COLORS.default }}
                />
                {v.label}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PrototypeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const previewVariant = searchParams.get("variant");
  const [participantId, setParticipantId] = useState<string | undefined>();
  const [studyId, setStudyId] = useState<string | undefined>();
  const [variantConfig, setVariantConfig] = useState<VariantConfig | undefined>();
  const [posts, setPosts] = useState<PrototypePost[] | undefined>();
  const [subreddits, setSubreddits] = useState<PrototypeSubreddit[] | undefined>();
  const [loading, setLoading] = useState(true);
  const { track } = useTracking({ participantId, studyId, variant: variantConfig?.id });

  // Verify participant token if present
  useEffect(() => {
    if (token) {
      fetch(`/api/auth/participant?token=${encodeURIComponent(token)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.valid) {
            setParticipantId(data.participantId);
            setStudyId(data.studyId);
            if (data.prototypeVariant && VARIANT_PRESETS[data.prototypeVariant]) {
              setVariantConfig(VARIANT_PRESETS[data.prototypeVariant]);
            }
            // Bypass auth gate for valid participants
            sessionStorage.setItem("reddit-proto-auth", "true");
          }
        })
        .catch(console.error);
    } else if (previewVariant && VARIANT_PRESETS[previewVariant]) {
      // Researcher preview mode via query param
      setVariantConfig(VARIANT_PRESETS[previewVariant]);
    }
  }, [token, previewVariant]);

  // Fetch Reddit data
  useEffect(() => {
    async function fetchData() {
      try {
        const [postsRes, subsRes] = await Promise.all([
          fetch("/api/reddit?action=popular&limit=25"),
          fetch("/api/reddit?action=popular_subreddits&limit=15"),
        ]);

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          const mapped = postsData.data.children.map(
            (c: { data: Parameters<typeof mapRedditPost>[0] }) =>
              mapRedditPost(c.data)
          );
          setPosts(mapped);
        }

        if (subsRes.ok) {
          const subsData = await subsRes.json();
          const mapped = subsData.data.children.map(
            (c: { data: Parameters<typeof mapRedditSubreddit>[0] }) =>
              mapRedditSubreddit(c.data)
          );
          setSubreddits(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch Reddit data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleLoadComments = useCallback(
    async (
      subreddit: string,
      postId: string,
      sort: string
    ): Promise<PrototypeComment[]> => {
      const res = await fetch(
        `/api/reddit?action=comments&subreddit=${encodeURIComponent(subreddit)}&postId=${encodeURIComponent(postId)}&sort=${sort}`
      );
      if (!res.ok) return [];
      const data = await res.json();
      const commentListing = data?.[1];
      if (!commentListing?.data?.children) return [];
      return commentListing.data.children
        .filter((c: { kind: string }) => c.kind === "t1")
        .map((c: { data: Parameters<typeof mapRedditComment>[0] }) =>
          mapRedditComment(c.data)
        );
    },
    []
  );

  const handleTrack = useCallback(
    (event: string, data?: Record<string, unknown>) => {
      track(event as Parameters<typeof track>[0], data);
    },
    [track]
  );

  if (loading) {
    return (
      <>
        <style>{prototypeStyles}</style>
        <div className="prototype-page">
          <div className="prototype-frame" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ color: "var(--reddit-orange, #FF4500)", fontSize: 18, fontWeight: 600 }}>
              Loading...
            </div>
          </div>
        </div>
      </>
    );
  }

  const isParticipant = !!token;

  return (
    <>
      <style>{prototypeStyles}</style>
      <PrototypeToolbar currentVariant={variantConfig} isParticipant={isParticipant} />
      {!isParticipant && <div className="proto-toolbar-spacer" />}
      {variantConfig && variantConfig.id !== "default" && isParticipant && (
        <div className="variant-badge">{variantConfig.label}</div>
      )}
      <div className="prototype-page">
        <div className="prototype-frame">
          {/* Notch */}
          <div className="prototype-notch" />
          <RedditMobile
            posts={posts}
            subreddits={subreddits}
            onTrack={handleTrack}
            onLoadComments={handleLoadComments}
            variantConfig={variantConfig}
          />
        </div>
      </div>
    </>
  );
}

export default function PrototypePage() {
  return (
    <Suspense
      fallback={
        <div className="prototype-page" style={{ color: "var(--reddit-orange, #FF4500)", fontSize: 18 }}>
          Loading...
        </div>
      }
    >
      <PrototypeContent />
    </Suspense>
  );
}
