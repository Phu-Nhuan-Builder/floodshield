export declare function useWallet(): {
    address: string | null;
    balance: bigint | null;
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
};
//# sourceMappingURL=useWallet.d.ts.map