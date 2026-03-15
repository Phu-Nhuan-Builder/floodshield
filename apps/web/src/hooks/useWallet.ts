// Wallet connection hook
import { useState, useCallback } from "react";
import { connectPhantom, isPhantomInstalled, getBalance } from "../services/solana";
import { useAppStore } from "../stores/appStore";

export function useWallet() {
  const { wallet, setWallet, disconnectWallet } = useAppStore();
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setError(null);

    if (!isPhantomInstalled()) {
      setError("Phantom wallet chưa được cài đặt. Vui lòng cài đặt tại phantom.app");
      return;
    }

    setWallet({ isConnecting: true });

    try {
      const address = await connectPhantom();
      if (!address) throw new Error("Kết nối bị từ chối");

      const balance = await getBalance(address);
      setWallet({ address, balance, isConnected: true, isConnecting: false });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lỗi kết nối ví");
      setWallet({ isConnecting: false });
    }
  }, [setWallet]);

  const disconnect = useCallback(() => {
    (window as any).solana?.disconnect?.();
    disconnectWallet();
  }, [disconnectWallet]);

  return {
    address: wallet.address,
    balance: wallet.balance,
    isConnected: wallet.isConnected,
    isConnecting: wallet.isConnecting,
    error,
    connect,
    disconnect,
  };
}
