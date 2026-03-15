// Solana wallet + program interaction service
import { createSolanaRpc, address, } from "@solana/kit";
import { SOLANA_CONFIG } from "@floodshield/shared";
// Create RPC with fallback
function createRpcWithFallback() {
    try {
        return createSolanaRpc(SOLANA_CONFIG.DEVNET_RPC);
    }
    catch {
        return createSolanaRpc(SOLANA_CONFIG.BACKUP_RPCS[0]);
    }
}
export const rpc = createRpcWithFallback();
export async function getBalance(walletAddress) {
    const result = await rpc.getBalance(address(walletAddress)).send();
    return result.value;
}
export async function getRecentBlockhash() {
    const result = await rpc.getLatestBlockhash().send();
    return result.value;
}
export async function confirmTransaction(signature, maxRetries = 30, intervalMs = 2000) {
    for (let i = 0; i < maxRetries; i++) {
        const result = await rpc
            .getSignatureStatuses([signature])
            .send();
        const status = result.value[0];
        if (status?.confirmationStatus === "confirmed" || status?.confirmationStatus === "finalized") {
            return true;
        }
        await new Promise((r) => setTimeout(r, intervalMs));
    }
    return false;
}
export function explorerUrl(signature) {
    return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}
// Phantom wallet detection
export function isPhantomInstalled() {
    return typeof window !== "undefined" && "solana" in window && window.solana?.isPhantom;
}
export async function connectPhantom() {
    if (!isPhantomInstalled())
        return null;
    try {
        const resp = await window.solana.connect();
        return resp.publicKey.toString();
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=solana.js.map