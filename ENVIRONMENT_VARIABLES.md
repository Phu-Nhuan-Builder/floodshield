# FloodShield VN — Complete Environment Variables Reference

**Project:** FloodShield Main (with ElevenLabs voice alerts)

> ⚠️ **SECURITY:** This file contains NO real secrets — only placeholder names.
> All real values must be stored in `.env.local`, `.dev.vars` (gitignored), or GitHub Secrets.

---

## 📋 Quick Summary

| File | Location | Purpose | In Git? |
|---|---|---|---|
| `.env.example` | `apps/web/` | Template | ✅ YES (no secrets) |
| `.env.local` | `apps/web/` | Actual values | ❌ .gitignore |
| `.dev.vars.example` | `packages/worker/` | Template | ✅ YES (no secrets) |
| `.dev.vars` | `packages/worker/` | Actual secrets | ❌ .gitignore |
| GitHub Secrets | GitHub repo settings | CI/CD | ❌ GitHub only |

---

## 🔑 Frontend Variables (VITE_* — 7 total)

Copy `.env.example` → `.env.local` and fill in real values:

```env
VITE_MAPBOX_TOKEN=<your_mapbox_public_token>
VITE_SUPABASE_URL=<your_supabase_project_url>
VITE_SUPABASE_ANON_KEY=<your_supabase_anon_key>
VITE_API_BASE_URL=http://localhost:8787
VITE_SOLANA_NETWORK=devnet
VITE_ELEVENLABS_VOICE_ID=<your_elevenlabs_voice_id>
VITE_PROGRAM_ID=<your_anchor_program_id_after_deploy>
```

---

## 🔑 Worker Secrets (.dev.vars — 8 total)

Copy `.dev.vars.example` → `.dev.vars` and fill in real values:

```env
SUPABASE_URL=<your_supabase_project_url>
SUPABASE_SERVICE_ROLE_KEY=<your_supabase_service_role_key>
SOLANA_RPC_URL=https://api.devnet.solana.com
PAYOUT_AUTHORITY_PRIVATE_KEY=<your_solana_payer_private_key>
PROGRAM_ID=<your_anchor_program_id_after_deploy>
ELEVENLABS_API_KEY=<your_elevenlabs_api_key>
ELEVENLABS_VOICE_ID=<your_elevenlabs_voice_id>
ENVIRONMENT=development
```

---

## 🔑 CI/CD Secrets (GitHub Secrets — 5 total)

Add these in **GitHub → Settings → Secrets and variables → Actions**:

| Secret Name | Description |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API token for Worker deployment |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID |
| `VERCEL_TOKEN` | Vercel deployment token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID (get after `vercel link`) |

---

## 📝 Variable Flow

```
Anchor deploy → get PROGRAM_ID
  ↓ update in .env.local, .dev.vars, GitHub Secrets
  ↓ redeploy Worker + Frontend
```

---

## 🔒 Security Checklist

- `.env.local` in `.gitignore`? ✅
- `.dev.vars` in `.gitignore`? ✅
- Supabase anon key safe to expose? ✅ (RLS-protected)
- Service role key only in Worker? ✅ (never in frontend)
- Solana private key only in Worker? ✅ (never in frontend)
