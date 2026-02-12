"use client";

import { useMemo } from "react";

interface SankeyEvent {
  type: string;
  sessionId: string;
  timestamp: number;
}

const NODE_COLORS: Record<string, string> = {
  session_start: "#22c55e",
  session_end: "#ef4444",
  page_view: "#3b82f6",
  tab_switch: "#a855f7",
  post_click: "#f97316",
  vote: "#f59e0b",
  comment_vote: "#eab308",
  search: "#06b6d4",
  community_click: "#6366f1",
  share_click: "#14b8a6",
  create_post_open: "#ec4899",
  sort_change: "#8b5cf6",
  survey_open: "#10b981",
  survey_submit: "#059669",
  survey_dismiss: "#6b7280",
  back_navigation: "#78716c",
  flair_click: "#d946ef",
  bookmark_click: "#f43f5e",
  comment_submit: "#0ea5e9",
  create_post_close: "#fb7185",
};

interface NodeLayout {
  id: string;
  level: number;
  value: number;
  y: number;
  height: number;
  color: string;
}

interface LinkLayout {
  source: string;
  target: string;
  value: number;
  sy0: number;
  sy1: number;
  ty0: number;
  ty1: number;
  color: string;
}

export default function SankeyDiagram({ events }: { events: SankeyEvent[] }) {
  const layout = useMemo(() => {
    // Group by session
    const sessionMap = new Map<string, SankeyEvent[]>();
    for (const e of events) {
      if (!sessionMap.has(e.sessionId)) sessionMap.set(e.sessionId, []);
      sessionMap.get(e.sessionId)!.push(e);
    }
    for (const list of sessionMap.values()) {
      list.sort((a, b) => a.timestamp - b.timestamp);
    }

    // Build deduplicated sequences (remove consecutive duplicates)
    const sequences: string[][] = [];
    for (const list of sessionMap.values()) {
      const seq: string[] = [];
      for (const e of list) {
        if (seq[seq.length - 1] !== e.type) seq.push(e.type);
      }
      if (seq.length > 1) sequences.push(seq);
    }

    if (sequences.length === 0) return null;

    // Count transitions and node totals
    const trans = new Map<string, number>();
    const nodeTotal = new Map<string, number>();
    const posAccum = new Map<string, number[]>();

    for (const seq of sequences) {
      for (let i = 0; i < seq.length; i++) {
        const type = seq[i];
        nodeTotal.set(type, (nodeTotal.get(type) || 0) + 1);
        if (!posAccum.has(type)) posAccum.set(type, []);
        posAccum.get(type)!.push(seq.length > 1 ? i / (seq.length - 1) : 0.5);
        if (i < seq.length - 1) {
          const key = `${type}->${seq[i + 1]}`;
          trans.set(key, (trans.get(key) || 0) + 1);
        }
      }
    }

    // Assign levels based on average position
    const nodeTypes = Array.from(nodeTotal.keys());
    const avgPos = new Map<string, number>();
    for (const type of nodeTypes) {
      const positions = posAccum.get(type)!;
      avgPos.set(type, positions.reduce((a, b) => a + b, 0) / positions.length);
    }
    if (avgPos.has("session_start")) avgPos.set("session_start", 0);
    if (avgPos.has("session_end")) avgPos.set("session_end", 1);

    // Determine number of discrete levels
    const numLevels = Math.max(2, Math.min(7, nodeTypes.length));

    const levelMap = new Map<string, number>();
    for (const type of nodeTypes) {
      let level = Math.round((avgPos.get(type) || 0) * (numLevels - 1));
      if (type === "session_start") level = 0;
      if (type === "session_end") level = numLevels - 1;
      levelMap.set(type, level);
    }

    // Build level groups and sort by total flow within each level
    const levelGroups = new Map<number, string[]>();
    for (const [type, level] of levelMap) {
      if (!levelGroups.has(level)) levelGroups.set(level, []);
      levelGroups.get(level)!.push(type);
    }
    for (const group of levelGroups.values()) {
      group.sort((a, b) => (nodeTotal.get(b) || 0) - (nodeTotal.get(a) || 0));
    }

    // Layout constants
    const H = 300;
    const PAD_Y = 15;
    const NODE_GAP = 10;
    const usableH = H - 2 * PAD_Y;

    // Calculate node positions
    const nodePos = new Map<string, { y: number; h: number }>();
    for (const [, group] of levelGroups) {
      const totalVal = group.reduce((s, t) => s + (nodeTotal.get(t) || 0), 0);
      const gaps = Math.max(0, group.length - 1) * NODE_GAP;
      const scale = totalVal > 0 ? (usableH - gaps) / totalVal : 0;
      let y = PAD_Y;
      for (const type of group) {
        const val = nodeTotal.get(type) || 0;
        const h = Math.max(6, val * scale);
        nodePos.set(type, { y, h });
        y += h + NODE_GAP;
      }
    }

    // Build node array
    const nodes: NodeLayout[] = nodeTypes.map((type) => ({
      id: type,
      level: levelMap.get(type) || 0,
      value: nodeTotal.get(type) || 0,
      y: nodePos.get(type)!.y,
      height: nodePos.get(type)!.h,
      color: NODE_COLORS[type] || "#6b7280",
    }));

    // Build links with stacked y offsets
    const srcOff = new Map<string, number>();
    const tgtOff = new Map<string, number>();
    for (const type of nodeTypes) {
      srcOff.set(type, nodePos.get(type)!.y);
      tgtOff.set(type, nodePos.get(type)!.y);
    }

    const sortedTrans = Array.from(trans.entries()).sort(([, a], [, b]) => b - a);

    const links: LinkLayout[] = [];
    for (const [key, value] of sortedTrans) {
      const [src, tgt] = key.split("->");
      const srcP = nodePos.get(src);
      const tgtP = nodePos.get(tgt);
      if (!srcP || !tgtP) continue;

      const srcVal = nodeTotal.get(src) || 1;
      const tgtVal = nodeTotal.get(tgt) || 1;
      const w = Math.max(1.5, value * Math.min(srcP.h / srcVal, tgtP.h / tgtVal));

      const sy = srcOff.get(src)!;
      const ty = tgtOff.get(tgt)!;
      srcOff.set(src, sy + w);
      tgtOff.set(tgt, ty + w);

      links.push({
        source: src,
        target: tgt,
        value,
        sy0: sy,
        sy1: sy + w,
        ty0: ty,
        ty1: ty + w,
        color: NODE_COLORS[src] || "#6b7280",
      });
    }

    return { nodes, links, numLevels, height: H };
  }, [events]);

  if (!layout) {
    return (
      <p className="mt-4 text-xs text-muted">
        Not enough session data to generate a flow diagram. At least one session with 2+ events is needed.
      </p>
    );
  }

  const { nodes, links, numLevels, height } = layout;
  const WIDTH = 700;
  const NODE_W = 12;
  const PAD_X = 10;
  const PAD_R = 130;
  const usableW = WIDTH - PAD_X - PAD_R - NODE_W;
  const levelStep = numLevels > 1 ? usableW / (numLevels - 1) : 0;
  const getX = (level: number) => PAD_X + level * levelStep;

  return (
    <div className="mt-5 border-t border-edge pt-5">
      <h3 className="mb-3 text-xs font-semibold text-secondary">User Flow</h3>
      <svg
        viewBox={`0 0 ${WIDTH} ${height}`}
        className="w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Links */}
        {links.map((link, i) => {
          const srcNode = nodes.find((n) => n.id === link.source)!;
          const tgtNode = nodes.find((n) => n.id === link.target)!;
          const sx = getX(srcNode.level) + NODE_W;
          const tx = getX(tgtNode.level);
          const mx = (sx + tx) / 2;

          const d = [
            `M ${sx} ${link.sy0}`,
            `C ${mx} ${link.sy0}, ${mx} ${link.ty0}, ${tx} ${link.ty0}`,
            `L ${tx} ${link.ty1}`,
            `C ${mx} ${link.ty1}, ${mx} ${link.sy1}, ${sx} ${link.sy1}`,
            `Z`,
          ].join(" ");

          return (
            <path
              key={i}
              d={d}
              fill={link.color}
              fillOpacity={0.2}
              stroke={link.color}
              strokeWidth={0.5}
              strokeOpacity={0.35}
            >
              <title>
                {link.source.replace(/_/g, " ")} → {link.target.replace(/_/g, " ")}: {link.value}
              </title>
            </path>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const x = getX(node.level);
          return (
            <g key={node.id}>
              <rect
                x={x}
                y={node.y}
                width={NODE_W}
                height={node.height}
                fill={node.color}
                rx={2}
              />
              <text
                x={x + NODE_W + 5}
                y={node.y + node.height / 2}
                dominantBaseline="middle"
                fill="currentColor"
                className="text-[8px] text-muted"
              >
                {node.id.replace(/_/g, " ")} ({node.value})
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
