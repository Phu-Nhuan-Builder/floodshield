#!/usr/bin/env bash
# =============================================================================
# FloodShield Main — Cloudflare Worker Deploy Script
# Run: bash deploy-worker.sh
# Prerequisites:
#   1. Cloudflare API token with Workers:Edit + KV:Edit + R2:Edit permissions
#   2. Set CLOUDFLARE_API_TOKEN env var or run `wrangler login` first
# =============================================================================

set -euo pipefail

WORKER_DIR="$(cd "$(dirname "$0")" && pwd)"
export PATH="$HOME/.nvm/versions/node/v24.12.0/bin:$PATH"

echo "🌊 FloodShield Main — Cloudflare Worker Deploy"
echo "================================================"

# Check auth
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "⚠️  CLOUDFLARE_API_TOKEN not set."
  echo "   Option A: export CLOUDFLARE_API_TOKEN=your_token_here"
  echo "   Option B: run 'npx wrangler login' first (opens browser)"
  echo ""
  read -r -p "Run 'wrangler login' now? [y/N] " choice
  if [[ "$choice" =~ ^[Yy]$ ]]; then
    npx wrangler login
  else
    echo "❌ Aborted. Set CLOUDFLARE_API_TOKEN and re-run."
    exit 1
  fi
fi

# Step 1: Verify dry-run succeeds
echo ""
echo "📦 Step 1: Dry-run build check..."
cd "$WORKER_DIR"
npx wrangler deploy --env="" --dry-run --outdir dist

echo ""
echo "✅ Bundle size OK. Proceeding with deployment..."

# Step 2: Upload secrets (if first deploy)
echo ""
echo "🔐 Step 2: Upload secrets to Cloudflare (skipped if already set)"
echo "   If first deploy, run manually:"
echo "   npx wrangler secret put SUPABASE_URL"
echo "   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY"
echo "   npx wrangler secret put SOLANA_RPC_URL"
echo "   npx wrangler secret put PAYOUT_AUTHORITY_PRIVATE_KEY"
echo "   npx wrangler secret put ELEVENLABS_API_KEY"
echo "   npx wrangler secret put ELEVENLABS_VOICE_ID"
echo "   npx wrangler secret put PROGRAM_ID"

# Step 3: Create R2 bucket (if first deploy)
echo ""
echo "🪣 Step 3: R2 bucket — creating if needed..."
npx wrangler r2 bucket create floodshield-geojson 2>/dev/null || echo "   (bucket may already exist)"

# Step 4: Deploy
echo ""
echo "🚀 Step 4: Deploying worker..."
npx wrangler deploy --env=""

echo ""
echo "🎉 Worker deployed successfully!"
echo "   Worker URL: https://floodshield-main-worker.YOUR_ACCOUNT.workers.dev"
echo ""
echo "📋 Next steps:"
echo "   1. Update apps/web/.env with VITE_API_BASE_URL=<worker_url>"
echo "   2. Deploy frontend: cd apps/web && npx vercel --prod"
