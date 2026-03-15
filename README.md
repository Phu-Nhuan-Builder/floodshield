<p align="center">
  <img src="https://img.shields.io/badge/Solana-Devnet-9945FF?logo=solana&logoColor=white" alt="Solana Devnet" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Cloudflare_Workers-F38020?logo=cloudflare&logoColor=white" alt="Cloudflare Workers" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Mapbox_GL-000000?logo=mapbox&logoColor=white" alt="Mapbox" />
  <img src="https://img.shields.io/badge/License-BSD_3--Clause-blue" alt="License" />
</p>

# 🌊 FloodShield VN

**Satellite-Powered Flood Warning & Transparent Aid for Vietnam's Mekong Delta**

> 🏆 Built by **Phú Nhuận Builder** — MVP completed March 15, 2026

🌐 **Live Demo:** [https://floodshield.phunhuanbuilder.com](https://floodshield.phunhuanbuilder.com)
📡 **API Health:** [https://floodshield-main-worker.bernie-web3.workers.dev/api/health](https://floodshield-main-worker.bernie-web3.workers.dev/api/health)

---

## 🎯 The Problem

Every year, **18 million people** in Vietnam's Mekong Delta (ĐBSCL) face devastating floods. Current systems suffer from:

- ⏳ **Slow warnings** — manual observation, hours-to-days delay
- 💸 **Opaque aid distribution** — corruption risk, no accountability
- 🗣️ **Language barriers** — existing alerts are not in Vietnamese with local context
- 📡 **Limited satellite data usage** — Sentinel-1 SAR data is free but underutilized

## 💡 The Solution

**FloodShield VN** combines **satellite imagery**, **on-chain transparency**, and **voice alerts** to protect farmers:

```
Sentinel-1 SAR Imagery → Automated Flood Detection → Real-time Alerts + Voice Warnings
                                    ↓
                      Severity Assessment (VV Backscatter < -15 dB)
                                    ↓
                      Solana Smart Contract → Transparent SOL Payouts
```

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🗺️ **Real-time Flood Map** | Interactive Mapbox GL map with severity-colored flood zones for 13 ĐBSCL provinces |
| 📡 **Sentinel-1 SAR Analysis** | Automated VV backscatter thresholding (< -15 dB = flooded) via Earth Search STAC API |
| 🔗 **On-Chain Aid Payouts** | Solana Anchor smart contract with parametric triggers — transparent, auditable SOL transfers |
| 🗣️ **Vietnamese Voice Alerts** | ElevenLabs TTS generates natural Vietnamese warnings with evacuation instructions |
| 📊 **Dashboard & Analytics** | Real-time stats, zone monitoring, alert management, payout history |
| ✅ **Community Verification** | Crowdsourced flood verification via photo upload |
| ⏰ **Cron-based Scanning** | Cloudflare Workers scheduled every 6 hours to detect new flood events |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React + Vite)                │
│  Mapbox GL Map │ Dashboard │ Alerts │ Payouts │ Verify      │
│  Deployed on: Vercel                                        │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST API
┌───────────────────────────▼─────────────────────────────────┐
│                  Cloudflare Worker (API + Cron)              │
│  /api/flood │ /api/alerts │ /api/payouts │ /api/verify      │
│  /voice/pre-generate │ Scheduled: 0 */6 * * *               │
│  KV Cache │ R2 GeoJSON Storage │ ElevenLabs TTS             │
└──────┬──────────────┬──────────────┬────────────────────────┘
       │              │              │
  ┌────▼────┐   ┌─────▼────┐   ┌────▼──────────┐
  │Supabase │   │ Solana   │   │ Earth Search  │
  │PostGIS  │   │ Devnet   │   │ STAC API      │
  │Realtime │   │ Anchor   │   │ Sentinel-1    │
  └─────────┘   └──────────┘   └───────────────┘
```

---

## 📁 Project Structure

```
floodshield/
├── apps/
│   └── web/                    # React + Vite frontend
│       ├── src/
│       │   ├── components/     # Map, Dashboard, Alerts, Common
│       │   ├── hooks/          # useFloodData, useMap, useWallet, useVoiceAlert
│       │   ├── pages/          # Dashboard, Alerts, Payouts, Verify
│       │   ├── services/       # API, Supabase, Solana, EarthSearch, VoiceAlert
│       │   ├── stores/         # Zustand global state
│       │   └── test/           # Vitest + Testing Library
│       └── vercel.json         # Vercel deploy config
│
├── packages/
│   ├── shared/                 # Shared types, constants, utils
│   │   └── src/
│   │       ├── constants/      # FLOOD_THRESHOLDS, PAYOUT_THRESHOLDS
│   │       ├── types/          # FloodZone, FloodAlert, AidPayout, FloodSeverity
│   │       └── utils/          # getSeverityFromFraction, severityToColor
│   │
│   └── worker/                 # Cloudflare Worker (API + Scheduler)
│       ├── src/
│       │   ├── routes/         # flood, alerts, payouts, verify, voice
│       │   ├── services/       # floodIndex, earthSearch, solanaService, elevenLabs
│       │   └── __tests__/      # floodEngine, payoutTrigger, response tests
│       └── wrangler.toml       # Cloudflare config (KV, R2, cron)
│
├── programs/
│   └── flood_payout/           # Solana Anchor smart contract (Rust)
│       └── programs/flood_payout/src/lib.rs
│
├── supabase/
│   └── migrations/             # SQL schema + seed data
│       ├── 00001_initial_schema.sql
│       └── 00002_seed_demo_data.sql
│
├── .github/workflows/ci.yml   # GitHub Actions CI/CD
├── turbo.json                  # Turborepo pipeline config
└── package.json                # Monorepo root
```

---

## 🧪 Tests

**74 total tests** across all packages:

| Package | Tests | Coverage |
|---|---|---|
| `packages/worker` | 36 tests (3 files) | Flood engine, payout trigger, response |
| `apps/web` | 23 tests (2 files) | Utils, voice alerts |
| **Total** | **59 tests** | All passing ✅ |

```bash
# Run all tests
pnpm test

# Run with coverage
cd apps/web && pnpm test
cd packages/worker && npx vitest run
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20.0.0
- **pnpm** ≥ 9.0.0
- **Rust** + **Anchor CLI** (for Solana program, optional)

### 1. Clone & Install

```bash
git clone https://github.com/Phu-Nhuan-Builder/floodshield.git
cd floodshield
pnpm install
```

### 2. Environment Setup

Copy the example files and fill in your credentials:

```bash
# Frontend
cp apps/web/.env.example apps/web/.env.local

# Worker
cp packages/worker/.dev.vars.example packages/worker/.dev.vars
```

Required environment variables — see [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for full details.

### 3. Run Locally

```bash
# Start both frontend + worker
pnpm dev

# Or start separately:
cd apps/web && pnpm dev          # Frontend → http://localhost:5173
cd packages/worker && pnpm dev   # Worker   → http://localhost:8787
```

### 4. Build

```bash
pnpm build
```

---

## 🔗 Solana Smart Contract

The `flood_payout` Anchor program provides 3 instructions:

| Instruction | Description |
|---|---|
| `initialize_authority` | One-time admin setup with base rate + max payout config |
| `trigger_payout` | Authority-signed SOL transfer to farmer wallet with on-chain record |
| `verify_flood_zone` | Oracle-style on-chain flood severity verification |

**Program ID:** `5ShXP9aCrTv543G75JbANuwLyK6ukwK8QVrKMdY6msje`
**Network:** Solana Devnet

### Payout Formula

```
amount = base_rate × land_area_ha × severity_multiplier
         (capped at max_payout_lamports)

Severity multipliers:
  low      → 0.5×
  medium   → 1.0×
  high     → 2.0×
  critical → 3.0×
```

---

## 🗄️ Database Schema (Supabase + PostGIS)

| Table | Description |
|---|---|
| `flood_zones` | Detected flood areas with severity, geometry, flood_index |
| `flood_alerts` | Alert messages in Vietnamese with acknowledgment tracking |
| `aid_payouts` | On-chain payout records with Solana tx signatures |
| `verified_reports` | Community-submitted verification photos |

All tables have RLS (Row Level Security) enabled. See [`supabase/migrations/`](./supabase/migrations/) for full schema.

---

## ☁️ Deployment

| Service | URL | Purpose |
|---|---|---|
| **Vercel** | [floodshield.phunhuanbuilder.com](https://floodshield.phunhuanbuilder.com) | Frontend (React + Vite) |
| **Cloudflare Workers** | `floodshield-main-worker.bernie-web3.workers.dev` | API + Cron scheduler |
| **Supabase** | Managed PostgreSQL + PostGIS | Database + Realtime |
| **Solana Devnet** | Program `5ShXP9a...` | Smart contract |

### Deploy Frontend

```bash
cd apps/web && vercel --prod
```

### Deploy Worker

```bash
cd packages/worker && npx wrangler deploy
```

See [GITHUB_ACTIONS_SECRETS.md](./GITHUB_ACTIONS_SECRETS.md) for CI/CD setup.

---

## 🛣️ Roadmap

- [x] Sentinel-1 SAR flood detection pipeline
- [x] Real-time Mapbox flood visualization
- [x] Solana Anchor parametric payout contract
- [x] ElevenLabs Vietnamese voice alerts
- [x] Supabase PostGIS schema + seed data
- [x] Cloudflare Worker API + 6-hour cron
- [x] Community flood verification (photo upload)
- [x] 74 unit tests with coverage
- [x] CI/CD pipeline (GitHub Actions)
- [x] Production deployment (Vercel + Cloudflare)
- [ ] Anchor program deployment to Devnet
- [ ] Mainnet-beta migration
- [ ] Mobile PWA support
- [ ] Multi-language support (Khmer, Thai)
- [ ] Integration with Vietnam's NCHMF (national weather service)

---

## 🧑‍💻 Team

**Phú Nhuận Builder**

| Role | Name | Contact |
|---|---|---|
| 🧑‍💻 Author / Owner | **Bernie Nguyen** | [bernie.web3@gmail.com](mailto:bernie.web3@gmail.com) |
| 🏢 Team | **Phú Nhuận Builder** | [phunhuanbuilder@gmail.com](mailto:phunhuanbuilder@gmail.com) |
| 💬 Telegram / X | @iambernieweb3 | [t.me/iambernieweb3](https://t.me/iambernieweb3) |

---

## 📜 License

[BSD 3-Clause License](./LICENSE) — © 2026 Phú Nhuận Builder

---

<p align="center">
  <b>🌾 Protecting Mekong Delta farmers with satellite data and blockchain transparency 🌾</b>
  <br/>
  <sub>MVP completed: Sunday, March 15, 2026</sub>
</p>
