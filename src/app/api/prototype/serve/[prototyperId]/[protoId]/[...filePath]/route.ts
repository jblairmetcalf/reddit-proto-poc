import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getMimeType } from "@/lib/mime";
import JSZip from "jszip";
import { transform } from "sucrase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProtoDoc {
  fileName: string;
  fileUrl: string;
}

interface CachedZip {
  files: Map<string, Uint8Array>;
  expiresAt: number;
}

// ---------------------------------------------------------------------------
// ZIP cache – in-memory, 5-minute TTL
// ---------------------------------------------------------------------------

const zipCache = new Map<string, CachedZip>();
const ZIP_TTL_MS = 5 * 60 * 1000;

function cleanExpired() {
  const now = Date.now();
  for (const [key, entry] of zipCache) {
    if (now > entry.expiresAt) zipCache.delete(key);
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SAFE_ID = /^[a-zA-Z0-9_-]+$/;

function ext(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function isZip(name: string) {
  return ext(name) === "zip";
}

function isJsx(name: string) {
  const e = ext(name);
  return e === "jsx" || e === "tsx";
}

function isHtml(name: string) {
  const e = ext(name);
  return e === "html" || e === "htm";
}

/**
 * Strip the common top-level directory from ZIP entries if every file shares
 * the same root folder (e.g. `my-project/index.html` → `index.html`).
 */
function stripCommonPrefix(paths: string[]): string {
  if (paths.length === 0) return "";
  const first = paths[0].split("/")[0];
  const allShare = paths.every((p) => p.startsWith(first + "/"));
  return allShare ? first + "/" : "";
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

type RouteContext = {
  params: Promise<{
    prototyperId: string;
    protoId: string;
    filePath: string[];
  }>;
};

export async function GET(req: NextRequest, ctx: RouteContext) {
  const { prototyperId, protoId, filePath } = await ctx.params;

  // Validate IDs
  if (!SAFE_ID.test(prototyperId) || !SAFE_ID.test(protoId)) {
    return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
  }

  // Validate filePath segments — no path traversal
  const requestedPath = filePath.join("/");
  if (requestedPath.includes("..") || requestedPath.startsWith("/")) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  // Fetch prototype metadata
  const snap = await getDoc(
    doc(db, "prototypers", prototyperId, "prototypes", protoId)
  );
  if (!snap.exists()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const proto = snap.data() as ProtoDoc;
  if (!proto.fileUrl) {
    return NextResponse.json({ error: "No file" }, { status: 404 });
  }

  const fileName = proto.fileName;

  try {
    // ----- ZIP -----
    if (isZip(fileName)) {
      return await serveZipFile(prototyperId, protoId, proto.fileUrl, requestedPath);
    }

    // ----- JSX / TSX -----
    if (isJsx(fileName)) {
      return await serveJsx(proto.fileUrl, fileName);
    }

    // ----- HTML -----
    if (isHtml(fileName)) {
      return await serveHtml(proto.fileUrl);
    }

    // Fallback: proxy with correct MIME
    const res = await fetch(proto.fileUrl);
    if (!res.ok) {
      return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
    }
    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      headers: { "Content-Type": getMimeType(fileName), "Access-Control-Allow-Origin": "*" },
    });
  } catch (err) {
    console.error("Serve error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// CORS preflight — sandboxed iframes send Origin: null, and frameworks like
// Next.js RSC add custom headers (RSC, Next-Router-State-Tree, etc.) that
// trigger preflight OPTIONS requests.
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Max-Age": "86400",
    },
  });
}

// ---------------------------------------------------------------------------
// HTML handler
// ---------------------------------------------------------------------------

async function serveHtml(fileUrl: string) {
  const res = await fetch(fileUrl);
  if (!res.ok) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }
  const html = await res.text();
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Access-Control-Allow-Origin": "*" },
  });
}

// ---------------------------------------------------------------------------
// JSX / TSX handler
// ---------------------------------------------------------------------------

/**
 * Collect bare module specifiers from transpiled code.
 * Skips relative ("./"), absolute ("/"), and URL ("https://") imports.
 */
function collectBareImports(code: string): Set<string> {
  const bare = new Set<string>();
  const re = /\bimport\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(code)) !== null) {
    const spec = m[1];
    if (spec.startsWith(".") || spec.startsWith("/") || spec.includes("://")) continue;
    bare.add(spec);
  }
  return bare;
}

/** Extract the npm package name from a specifier (handles @scoped packages). */
function getPackageName(specifier: string): string {
  if (specifier.startsWith("@")) {
    const parts = specifier.split("/");
    return parts.slice(0, 2).join("/");
  }
  return specifier.split("/")[0];
}

/** Build import map entries for bare imports, using esm.sh CDN. */
function buildImportMapEntries(bareImports: Set<string>): Record<string, string> {
  const entries: Record<string, string> = {};
  const packages = new Set<string>();

  for (const spec of bareImports) {
    const pkg = getPackageName(spec);
    // Skip react/react-dom — already in the base import map
    if (pkg === "react" || pkg === "react-dom") continue;
    packages.add(pkg);
    // Map the exact specifier
    entries[spec] = `https://esm.sh/${spec}?external=react,react-dom`;
  }

  // Add trailing-slash prefix mapping for each package (handles unmapped subpaths)
  for (const pkg of packages) {
    entries[`${pkg}/`] = `https://esm.sh/${pkg}/?external=react,react-dom`;
  }

  return entries;
}

async function serveJsx(fileUrl: string, fileName: string) {
  const res = await fetch(fileUrl);
  if (!res.ok) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }
  const source = await res.text();

  // Transform JSX + TypeScript only; keep ES imports/exports intact
  const { code } = transform(source, {
    transforms: ["jsx", "typescript"],
    jsxRuntime: "classic",
    production: true,
  });

  // Find default-exported component name for auto-render
  // Matches: export default function Foo, export default class Foo, export default Foo
  const nameMatch =
    code.match(/export\s+default\s+(?:function|class)\s+(\w+)/) ??
    code.match(/export\s+default\s+(\w+)\s*;/);
  const componentName = nameMatch?.[1] ?? null;

  // Ensure React is importable (classic JSX emits React.createElement)
  const hasReactImport = /\bimport\s+React[\s,{]/.test(code);
  const reactImportLine = hasReactImport ? "" : 'import React from "react";\n';

  // Detect bare module imports and map them to esm.sh
  const bareImports = collectBareImports(code);
  const extraEntries = buildImportMapEntries(bareImports);

  const importMap = JSON.stringify({
    imports: {
      "react": "https://esm.sh/react@19",
      "react/jsx-runtime": "https://esm.sh/react@19/jsx-runtime",
      "react-dom": "https://esm.sh/react-dom@19",
      "react-dom/client": "https://esm.sh/react-dom@19/client",
      ...extraEntries,
    },
  }, null, 2);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(fileName)}</title>
  <style>body { margin: 0; }</style>
  <script type="importmap">
  ${importMap}
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module">
${reactImportLine}import { createRoot as __createRoot } from "react-dom/client";

${code}

// Auto-render
const __c = ${componentName ? componentName : "typeof App !== 'undefined' ? App : typeof Main !== 'undefined' ? Main : null"};
if (__c) {
  __createRoot(document.getElementById('root')).render(React.createElement(__c));
}
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Access-Control-Allow-Origin": "*" },
  });
}

// ---------------------------------------------------------------------------
// ZIP handler
// ---------------------------------------------------------------------------

async function serveZipFile(
  prototyperId: string,
  protoId: string,
  fileUrl: string,
  requestedPath: string
) {
  cleanExpired();

  const cacheKey = `${prototyperId}/${protoId}/${fileUrl}`;
  let cached = zipCache.get(cacheKey);

  if (!cached) {
    // Download and extract
    const res = await fetch(fileUrl);
    if (!res.ok) {
      return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
    }
    const buffer = await res.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);

    const files = new Map<string, Uint8Array>();
    const allPaths: string[] = [];

    for (const [path, entry] of Object.entries(zip.files)) {
      // Skip directories, macOS metadata, and hidden files
      if (entry.dir) continue;
      if (path.startsWith("__MACOSX/") || path.startsWith(".")) continue;
      const basename = path.split("/").pop() ?? "";
      if (basename.startsWith("._") || basename === ".DS_Store") continue;
      allPaths.push(path);
    }

    const prefix = stripCommonPrefix(allPaths);

    for (const path of allPaths) {
      const normalizedPath = prefix ? path.slice(prefix.length) : path;
      if (normalizedPath) {
        const data = await zip.files[path].async("uint8array");
        files.set(normalizedPath, data);
      }
    }

    cached = { files, expiresAt: Date.now() + ZIP_TTL_MS };
    zipCache.set(cacheKey, cached);
  }

  let fileData = cached.files.get(requestedPath);
  let resolvedPath = requestedPath;

  // Extensionless fallback — static-site generators (Next.js, Gatsby, etc.)
  // export /mail as mail.html or mail/index.html
  if (!fileData && !requestedPath.includes(".")) {
    const htmlPath = requestedPath ? requestedPath + ".html" : "index.html";
    const indexPath = requestedPath ? requestedPath + "/index.html" : "index.html";
    if (cached.files.has(htmlPath)) {
      fileData = cached.files.get(htmlPath)!;
      resolvedPath = htmlPath;
    } else if (cached.files.has(indexPath)) {
      fileData = cached.files.get(indexPath)!;
      resolvedPath = indexPath;
    }
  }

  if (!fileData) {
    return NextResponse.json(
      { error: "File not found in archive" },
      { status: 404 }
    );
  }

  // Sandboxed iframes have origin "null", so all responses need CORS headers
  const cors = { "Access-Control-Allow-Origin": "*" };

  // For HTML files: rewrite root-relative paths, inject a URL interceptor for
  // JS-initiated requests, and strip crossorigin attributes.
  if (isHtml(resolvedPath)) {
    const serveBase = `/api/prototype/serve/${prototyperId}/${protoId}`;
    const escapedPrefix = serveBase
      .slice(1)
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    let html = new TextDecoder().decode(fileData);

    // 1) Rewrite bare root "/" → index.html  (href="/" → href="…/index.html")
    html = html.replace(
      /((?:src|href|action)\s*=\s*["'])\/(["'])/gi,
      `$1${serveBase}/index.html$2`,
    );
    // 2) Rewrite remaining root-relative paths, skip already-rewritten ones
    html = html.replace(
      new RegExp(
        `((?:src|href|action)\\s*=\\s*["'])\\/(?!\\/|${escapedPrefix})`,
        "gi",
      ),
      `$1${serveBase}/`,
    );
    // 3) Strip crossorigin attributes — assets are now same-origin via API
    html = html.replace(
      /\s+crossorigin(?:\s*=\s*["'][^"']*["'])?/gi,
      "",
    );

    // 4) Inject URL interceptor for JS-initiated requests (fetch, XHR,
    //    dynamic script/link creation). Client-side frameworks like Next.js
    //    (RSC payloads, prefetching) and webpack (code-split chunks) construct
    //    root-relative URLs in JS that bypass the HTML attribute rewriting.
    const interceptor =
      `<script>(function(){` +
      `var B="${serveBase}";` +
      `var O=(location.href.match(/^https?:\\/\\/[^\\/]+/)||[""])[0];` +
      `function R(u){if(typeof u!="string")return u;` +
      `if(u[0]=="/"&&u[1]!="/"&&u.slice(0,B.length)!=B)return B+u;` +
      `if(O&&u.slice(0,O.length+1)==O+"/"){var p=u.slice(O.length);` +
      `if(p.slice(0,B.length)!=B)return O+B+p}return u}` +
      `var F=window.fetch;window.fetch=function(u,o){` +
      `if(typeof u=="string")u=R(u);` +
      `else if(u instanceof Request){try{var n=R(u.url);` +
      `if(n!=u.url)u=new Request(n,u)}catch(e){}}` +
      `return F.call(this,u,o)};` +
      `var X=XMLHttpRequest.prototype.open;` +
      `XMLHttpRequest.prototype.open=function(){` +
      `var a=[].slice.call(arguments);` +
      `if(typeof a[1]=="string")a[1]=R(a[1]);` +
      `return X.apply(this,a)};` +
      `var C=document.createElement.bind(document);` +
      `document.createElement=function(t){` +
      `var e=C.apply(document,arguments);` +
      `var l=(typeof t=="string"?t:"").toLowerCase();` +
      `if(l=="script"){` +
      `var d=Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype,"src");` +
      `if(d&&d.set)Object.defineProperty(e,"src",` +
      `{set:function(v){d.set.call(this,R(v))},get:d.get,configurable:1})}` +
      `else if(l=="link"){` +
      `var d2=Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype,"href");` +
      `if(d2&&d2.set)Object.defineProperty(e,"href",` +
      `{set:function(v){d2.set.call(this,R(v))},get:d2.get,configurable:1})}` +
      `return e}})()</script>`;

    html = html.replace(/<head(?:\s[^>]*)?>/, "$&" + interceptor);

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8", ...cors },
    });
  }

  return new NextResponse(Buffer.from(fileData), {
    headers: { "Content-Type": getMimeType(resolvedPath), ...cors },
  });
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
