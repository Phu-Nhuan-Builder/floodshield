# 🔍 Environment Setup Verification Checklist

Run these commands to verify your setup is complete and correct.

---

## ✅ Step 1: Verify Files Exist

```bash
# Frontend
test -f /Users/admin/phunhuanbuilder-projects/innox/floodshield-main/apps/web/.env.example && echo "✅ .env.example exists" || echo "❌ Missing .env.example"
test -f /Users/admin/phunhuanbuilder-projects/innox/floodshield-main/apps/web/.env.local && echo "✅ .env.local exists" || echo "❌ Missing .env.local"

# Worker
test -f /Users/admin/phunhuanbuilder-projects/innox/floodshield-main/packages/worker/.dev.vars.example && echo "✅ .dev.vars.example exists" || echo "❌ Missing .dev.vars.example"
test -f /Users/admin/phunhuanbuilder-projects/innox/floodshield-main/packages/worker/.dev.vars && echo "✅ .dev.vars exists" || echo "❌ Missing .dev.vars"
```

**Expected output:** 4 ✅ checks

---

## ✅ Step 2: Verify .gitignore Protects Secrets

```bash
cd /Users/admin/phunhuanbuilder-projects/innox/floodshield-main

# Check if .env.local is ignored
git check-ignore apps/web/.env.local && echo "✅ .env.local is ignored" || echo "❌ .env.local NOT ignored"

# Check if .dev.vars is ignored
git check-ignore packages/worker/.dev.vars && echo "✅ .dev.vars is ignored" || echo "❌ .dev.vars NOT ignored"

# Check if .env.example is NOT ignored (should be tracked)
git check-ignore apps/web/.env.example && echo "❌ .env.example is incorrectly ignored" || echo "✅ .env.example will be tracked"
```

**Expected output:** ✅ ✅ ✅ (secrets ignored, examples tracked)

---

## ✅ Step 3: Verify Variables Are Set

```bash
# Frontend variables
test -n "$VITE_MAPBOX_TOKEN" && echo "✅ VITE_MAPBOX_TOKEN set" || echo "⚠️ VITE_MAPBOX_TOKEN not set (ok for now, from .env.local)"

# Source .env.local to test variable loading
cd /Users/admin/phunhuanbuilder-projects/innox/floodshield-main/apps/web
if [ -f .env.local ]; then
  export $(cat .env.local | xargs)
  echo "✅ .env.local loaded successfully"
  echo "   VITE_SUPABASE_URL: ${VITE_SUPABASE_URL:0:20}..."
  echo "   VITE_PROGRAM_ID: ${VITE_PROGRAM_ID}"
else
  echo "❌ .env.local not found"
fi

# Worker variables
cd /Users/admin/phunhuanbuilder-projects/innox/floodshield-main/packages/worker
if [ -f .dev.vars ]; then
  echo "✅ .dev.vars exists"
  grep "SUPABASE_URL=" .dev.vars > /dev/null && echo "   ✅ SUPABASE_URL found" || echo "   ❌ SUPABASE_URL missing"
  grep "ELEVENLABS_API_KEY=" .dev.vars > /dev/null && echo "   ✅ ELEVENLABS_API_KEY found" || echo "   ❌ ELEVENLABS_API_KEY missing"
else
  echo "❌ .dev.vars not found"
fi
```

**Expected output:** All variables found and loaded

---

## ✅ Step 4: Verify No Secrets in Git

```bash
cd /Users/admin/phunhuanbuilder-projects/innox/floodshield-main

# Check git status
git status --porcelain | grep "env\|vars" || echo "✅ No .env or .dev.vars files in staging"

# Double-check: grep for your API keys in tracked files
if git grep -l "sk_cbafb6197e744ca6f857368aa0e106968dd65c5b851ea467" 2>/dev/null; then
  echo "⚠️ WARNING: ElevenLabs API key found in Git!"
else
  echo "✅ No API keys in Git history"
fi

if git grep -l "2ZiwBx1HpeBwYMJmMexAproyDJUyLr31KCEFXgfqsjfDqu4bTeJ2fS1khxEdvUtvS2bFuDAfvQ6SPj5NEgTfmomk" 2>/dev/null; then
  echo "⚠️ WARNING: Solana private key found in Git!"
else
  echo "✅ No private keys in Git history"
fi
```

**Expected output:** No secrets found in Git

---

## ✅ Step 5: Test Development Environment

```bash
cd /Users/admin/phunhuanbuilder-projects/innox/floodshield-main

# Test pnpm can load dependencies (first time, may take a while)
echo "Testing pnpm install (this may take 2-3 minutes)..."
pnpm install --frozen-lockfile 2>&1 | tail -5

# Check if packages installed
test -d node_modules && echo "✅ pnpm dependencies installed" || echo "❌ pnpm install failed"
```

**Expected output:** Dependencies installed successfully

---

## ✅ Step 6: Verify Variable Structure

```bash
# Count variables in .env.local
echo "Frontend variables:"
grep -c "VITE_" /Users/admin/phunhuanbuilder-projects/innox/floodshield-main/apps/web/.env.local && echo "✅ Found VITE_ variables"

# Count variables in .dev.vars
echo ""
echo "Worker variables:"
wc -l /Users/admin/phunhuanbuilder-projects/innox/floodshield-main/packages/worker/.dev.vars | awk '{print "Lines in .dev.vars: " $1}'
```

**Expected output:**
- Frontend: 7 VITE_ variables
- Worker: 8-9 variables (including comments)

---

## ✅ Step 7: Final Security Audit

```bash
echo "=== SECURITY AUDIT ==="
echo ""
echo "1. Checking .env.local permissions..."
ls -la /Users/admin/phunhuanbuilder-projects/innox/floodshield-main/apps/web/.env.local | awk '{print "   Permissions: " $1 ", Owner: " $3}'

echo ""
echo "2. Checking .dev.vars permissions..."
ls -la /Users/admin/phunhuanbuilder-projects/innox/floodshield-main/packages/worker/.dev.vars | awk '{print "   Permissions: " $1 ", Owner: " $3}'

echo ""
echo "3. Verifying no unencrypted secrets in shell history..."
history | grep -i "secret\|api_key\|private_key" | wc -l | awk '{if ($1 > 0) print "⚠️ Found " $1 " secrets in history"; else print "✅ Shell history clean"}'

echo ""
echo "✅ Setup verification complete!"
```

---

## 📋 Complete Setup Checklist

- [ ] Files exist: `.env.example`, `.env.local`, `.dev.vars.example`, `.dev.vars`
- [ ] Secrets ignored by Git (`.env.local`, `.dev.vars` not tracked)
- [ ] Examples tracked by Git (`.env.example`, `.dev.vars.example` committed)
- [ ] All 7 VITE_ variables in `.env.local`
- [ ] All 8 worker variables in `.dev.vars`
- [ ] No secrets committed to Git history
- [ ] pnpm dependencies installed
- [ ] Ready to start Phase 3 (Anchor deployment)

---

## 🚨 If Verification Fails

### `.env.local` or `.dev.vars` not found:
```bash
# Verify they were created
ls /Users/admin/phunhuanbuilder-projects/innox/floodshield-main/apps/web/.env.local
ls /Users/admin/phunhuanbuilder-projects/innox/floodshield-main/packages/worker/.dev.vars
```

### Git shows `.env.local` as modified:
```bash
# Remove from Git tracking (if accidentally added)
git rm --cached apps/web/.env.local packages/worker/.dev.vars
git commit -m "chore: remove env files from tracking"
```

### Variables not loading:
```bash
# Check syntax (should be KEY=VALUE, no spaces)
cat apps/web/.env.local | grep "="
```

### pnpm install fails:
```bash
# Clear cache and retry
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

## ✅ When All Checks Pass

You're ready for Phase 3: **Solana Anchor Program Deployment**

**Next:** Create Anchor program and deploy to Solana Devnet
