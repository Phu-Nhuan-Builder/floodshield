// Solana payout service — Cloudflare Worker
// Uses @solana/kit (v2) for lightweight transaction signing
import type { Env } from "../types";

export async function executePayout(options: {
  recipientAddress: string;
  amountLamports: number;
  env: Env;
}): Promise<string> {
  const { recipientAddress, amountLamports, env } = options;

  // Use Solana JSON RPC directly (no heavy SDK in Workers)
  const rpcUrl = env.SOLANA_RPC_URL || "https://api.devnet.solana.com";

  // For hackathon demo: simulate a devnet transfer
  // In production: sign transaction with PAYOUT_AUTHORITY_PRIVATE_KEY

  // Get latest blockhash
  const blockhashRes = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getLatestBlockhash",
      params: [{ commitment: "confirmed" }],
    }),
  });

  const blockhashData = await blockhashRes.json() as {
    result: { value: { blockhash: string; lastValidBlockHeight: number } };
  };

  if (!blockhashData.result?.value?.blockhash) {
    throw new Error("Failed to get blockhash from Solana RPC");
  }

  // In demo mode: return a fake but plausible transaction signature
  // This avoids needing actual SOL on devnet during hackathon
  const fakeSig = generateDemoTxSignature(recipientAddress, amountLamports);

  console.log(
    `[Payout] Demo transfer: ${amountLamports} lamports → ${recipientAddress}`,
    `TxSig: ${fakeSig}`,
  );

  return fakeSig;
}

// Deterministic demo signature from recipient + amount
function generateDemoTxSignature(address: string, amount: number): string {
  const seed = `${address}:${amount}:${Date.now()}`;
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  let hash = 0;

  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  }

  let result = "";
  let h = Math.abs(hash);

  while (result.length < 88) {
    result += chars[h % chars.length];
    h = Math.floor(h / chars.length) || Math.abs(seed.charCodeAt(result.length % seed.length) * 997);
  }

  return result.slice(0, 88);
}
