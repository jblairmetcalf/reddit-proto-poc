#!/usr/bin/env bash
set -euo pipefail

# Deploy reddit-proto-poc (Next.js via Vercel git integration) + Storybook (prebuilt static)
# Usage: npm run deploy

echo "==> Pushing to origin..."
git push

echo "==> Building Storybook..."
npx storybook build --quiet

echo "==> Preparing prebuilt output..."
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

# Set up .vercel/output structure for --prebuilt deploy
mkdir -p "$TMPDIR/.vercel/output/static"
echo '{ "version": 3 }' > "$TMPDIR/.vercel/output/config.json"

# Copy build artifacts
cp -r storybook-static/* "$TMPDIR/.vercel/output/static/"

# Link to the correct Vercel project
npx vercel link --project reddit-proto-poc-storybook --yes --cwd "$TMPDIR"

echo "==> Deploying Storybook to production..."
npx vercel deploy --prebuilt --prod --yes --cwd "$TMPDIR"

echo ""
echo "Done! Next.js deploys via Vercel git integration."
echo "Storybook: https://reddit-proto-poc-storybook.vercel.app"
