#!/usr/bin/env bash
# =============================================================================
# FloodShield Main — Upload secrets to Cloudflare Worker
# Run AFTER 'wrangler login' or with CLOUDFLARE_API_TOKEN set
# Usage: bash upload-secrets.sh
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DEVVARS="$SCRIPT_DIR/.dev.vars"
export PATH="$HOME/.nvm/versions/node/v24.12.0/bin:$PATH"

if [ ! -f "$DEVVARS" ]; then
  echo "❌ .dev.vars not found at $DEVVARS"
  exit 1
fi

echo "🔐 Uploading secrets from .dev.vars to Cloudflare Worker..."
echo "   Worker: floodshield-main-worker"
echo ""

# Read each key from .dev.vars and upload as secret
while IFS='=' read -r key value; do
  # Skip comments and empty lines
  [[ "$key" =~ ^#.*$ ]] && continue
  [[ -z "$key" ]] && continue

  # Trim whitespace
  key="$(echo "$key" | xargs)"
  value="$(echo "$value" | xargs)"

  [[ -z "$key" ]] && continue

  echo "   Uploading: $key"
  echo "$value" | npx wrangler secret put "$key" --env="" 2>/dev/null && echo "   ✅ $key" || echo "   ⚠️  $key (may already exist)"

done < "$DEVVARS"

echo ""
echo "✅ Secrets upload complete!"
