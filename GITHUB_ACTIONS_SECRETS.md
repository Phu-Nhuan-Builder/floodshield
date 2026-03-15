# GitHub Actions Secrets Setup

Add these secrets to your repository at:
**Settings → Secrets and variables → Actions → New repository secret**

> ⚠️ **SECURITY:** Do NOT paste real values in this file — store them only in GitHub Secrets.

---

## Build-Time Secrets (used during `pnpm build`)

| Secret Name | Description |
|---|---|
| `MAPBOX_TOKEN` | Mapbox public token (from account.mapbox.com) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key (RLS-protected, safe in builds) |
| `API_BASE_URL` | Cloudflare Worker URL (production) |
| `PROGRAM_ID` | Solana program ID (set after `anchor deploy`) |
| `ELEVENLABS_VOICE_ID` | ElevenLabs voice ID |

---

## Deployment Secrets (used by GitHub Actions CI/CD)

| Secret Name | Description |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token for Worker deployment |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `VERCEL_TOKEN` | Vercel deployment token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID (get after `vercel link`) |

---

## Setup Steps

1. Go to: **GitHub Repo → Settings → Secrets and variables → Actions**
2. Click **"New repository secret"**
3. Add each secret above one by one with real values from your accounts
4. After Anchor deployment: update `PROGRAM_ID`
5. After `vercel link`: update `VERCEL_PROJECT_ID`

---

## How Secrets Are Used in Workflows

```yaml
# .github/workflows/ci.yml
env:
  VITE_MAPBOX_TOKEN: ${{ secrets.MAPBOX_TOKEN }}
  VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
  VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
  VITE_PROGRAM_ID: ${{ secrets.PROGRAM_ID }}
  VITE_ELEVENLABS_VOICE_ID: ${{ secrets.ELEVENLABS_VOICE_ID }}
```
