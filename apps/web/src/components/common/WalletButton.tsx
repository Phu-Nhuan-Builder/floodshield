// Wallet connect button
import { Wallet, LogOut, Copy, ExternalLink } from "lucide-react";
import { useWallet } from "../../hooks/useWallet";
import { truncateAddress, formatSolAmount } from "@floodshield/shared";

interface WalletButtonProps {
  compact?: boolean;
}

export function WalletButton({ compact }: WalletButtonProps) {
  const { address, balance, isConnected, isConnecting, error, connect, disconnect } = useWallet();

  const copyAddress = () => {
    if (address) navigator.clipboard.writeText(address);
  };

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className="btn-primary w-full text-xs"
        aria-label="Kết nối ví Phantom"
        title={error ?? "Kết nối ví Phantom"}
      >
        <Wallet className="w-4 h-4 flex-shrink-0" aria-hidden />
        {!compact && (
          <span>{isConnecting ? "Đang kết nối..." : "Kết nối ví"}</span>
        )}
      </button>
    );
  }

  return (
    <div className="space-y-1">
      {!compact && (
        <div className="px-2 py-1 rounded-lg bg-gray-800 text-xs">
          <div className="flex items-center justify-between gap-1">
            <span className="text-gray-400 font-mono truncate">{truncateAddress(address!)}</span>
            <div className="flex gap-1">
              <button onClick={copyAddress} className="p-1 hover:text-white" aria-label="Sao chép địa chỉ">
                <Copy className="w-3 h-3" aria-hidden />
              </button>
              <a
                href={`https://explorer.solana.com/address/${address}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="p-1 hover:text-white"
                aria-label="Xem trên Solana Explorer"
              >
                <ExternalLink className="w-3 h-3" aria-hidden />
              </a>
            </div>
          </div>
          {balance !== null && (
            <div className="text-green-400 font-mono mt-0.5">{formatSolAmount(Number(balance))}</div>
          )}
        </div>
      )}
      <button
        onClick={disconnect}
        className="btn-ghost w-full text-xs"
        aria-label="Ngắt kết nối ví"
      >
        <LogOut className="w-4 h-4 flex-shrink-0" aria-hidden />
        {!compact && <span>Ngắt kết nối</span>}
      </button>
    </div>
  );
}
