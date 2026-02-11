/**
 * Generates public/boilerplates/starter.zip
 *
 * Contents:
 *   index.html  — references style.css and script.js
 *   style.css   — dark-theme styles
 *   script.js   — simple interactive toggle
 *
 * Usage:  node scripts/build-starter-zip.js
 */

const JSZip = require("jszip");
const fs = require("fs");
const path = require("path");

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Starter Prototype</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <header>
    <h1>My Prototype</h1>
    <span class="badge">ZIP Bundle</span>
  </header>

  <main>
    <div class="card">
      <h2>Interactive Card</h2>
      <p>This starter uses separate HTML, CSS, and JS files bundled in a ZIP.</p>
      <button class="toggle-btn" id="toggleBtn">Toggle State</button>
      <p class="counter" id="counter">Toggled 0 times</p>
    </div>

    <div class="card">
      <h2>Getting Started</h2>
      <p>Edit these files to build your prototype. Relative references between HTML, CSS, and JS all work.</p>
    </div>
  </main>

  <script src="script.js"></script>
</body>
</html>`;

const styleCss = `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #09090b;
  color: #e4e4e7;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: #18181b;
  border-bottom: 1px solid #27272a;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

header h1 {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  background: rgba(234, 88, 12, 0.15);
  color: #fb923c;
  padding: 3px 8px;
  border-radius: 9999px;
}

main {
  flex: 1;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
}

.card {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 12px;
  padding: 20px;
  transition: border-color 0.15s;
}

.card:hover {
  border-color: #3f3f46;
}

.card h2 {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 6px;
}

.card p {
  font-size: 13px;
  color: #a1a1aa;
  line-height: 1.5;
}

.toggle-btn {
  margin-top: 14px;
  background: #ea580c;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.toggle-btn:hover {
  background: #f97316;
}

.toggle-btn.active {
  background: #16a34a;
}

.counter {
  margin-top: 10px;
  font-size: 12px;
  color: #71717a;
}`;

const scriptJs = `const btn = document.getElementById("toggleBtn");
const counter = document.getElementById("counter");
let active = false;
let count = 0;

btn.addEventListener("click", () => {
  active = !active;
  count++;
  btn.textContent = active ? "Active!" : "Toggle State";
  btn.classList.toggle("active", active);
  counter.textContent = \`Toggled \${count} time\${count === 1 ? "" : "s"}\`;
});`;

async function main() {
  const zip = new JSZip();
  zip.file("index.html", indexHtml);
  zip.file("style.css", styleCss);
  zip.file("script.js", scriptJs);

  const buf = await zip.generateAsync({ type: "nodebuffer" });
  const outPath = path.join(__dirname, "..", "public", "boilerplates", "starter.zip");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buf);
  console.log(`Created ${outPath} (${buf.length} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
