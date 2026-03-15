// Solana wallet + program interaction service
import {
  createSolanaRpc,
  address,
} from "@solana/kit";
import { SOLANA_CONFIG } from "@floodshield/shared";

// Create RPC with fallback
function createRpcWithFallback() {
  try {
    return createSolanaRpc(SOLANA_CONFIG.DEVNET_RPC);
  } catch {
    return createSolanaRpc(SOLANA_CONFIG.BACKUP_RPCS[0]!);
  }
}

export const rpc = createRpcWithFallback();

export async function getBalance(walletAddress: string): Promise<bigint> {
  const result = await rpc.getBalance(address(walletAddress)).send();
  return result.value;
}

export async function getRecentBlockhash() {
  const result = await rpc.getLatestBlockhash().send();
  return result.value;
}

export async function confirmTransaction(
  signature: string,
  maxRetries = 30,
  intervalMs = 2000,
): Promise<boolean> {
  for (let i = 0; i < maxRetries; i++) {
    const result = await rpc
      .getSignatureStatuses([signature as Parameters<typeof rpc.getSignatureStatuses>[0][0]])
      .send();

    const status = result.value[0];
    if (status?.confirmationStatus === "confirmed" || status?.confirmationStatus === "finalized") {
      return true;
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  return false;
}

export function explorerUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

// Phantom wallet detection
export function isPhantomInstalled(): boolean {
  return typeof window !== "undefined" && "solana" in window && (window as any).solana?.isPhantom;
}

export async function connectPhantom(): Promise<string | null> {
  if (!isPhantomInstalled()) return null;
  try {
    const resp = await (window as any).solana.connect();
    return resp.publicKey.toString() as string;
  } catch {
    return null;
  }
}
