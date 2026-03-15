import type { FloodAlert, FloodStats } from "@floodshield/shared";
interface WalletState {
    address: string | null;
    balance: bigint | null;
    isConnecting: boolean;
    isConnected: boolean;
}
interface AppState {
    wallet: WalletState;
    setWallet: (wallet: Partial<WalletState>) => void;
    disconnectWallet: () => void;
    activeAlerts: FloodAlert[];
    setActiveAlerts: (alerts: FloodAlert[]) => void;
    addAlert: (alert: FloodAlert) => void;
    dismissAlert: (alertId: string) => void;
    stats: FloodStats | null;
    setStats: (stats: FloodStats) => void;
    selectedZoneId: string | null;
    setSelectedZoneId: (id: string | null) => void;
    mapStyle: "dark" | "satellite" | "streets";
    setMapStyle: (style: AppState["mapStyle"]) => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    isDemoMode: boolean;
    setDemoMode: (demo: boolean) => void;
}
export declare const useAppStore: import("zustand").UseBoundStore<Omit<Omit<import("zustand").StoreApi<AppState>, "setState" | "devtools"> & {
    setState(partial: AppState | Partial<AppState> | ((state: AppState) => AppState | Partial<AppState>), replace?: false | undefined, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    setState(state: AppState | ((state: AppState) => AppState), replace: true, action?: (string | {
        [x: string]: unknown;
        [x: number]: unknown;
        [x: symbol]: unknown;
        type: string;
    }) | undefined): void;
    devtools: {
        cleanup: () => void;
    };
}, "subscribe"> & {
    subscribe: {
        (listener: (selectedState: AppState, previousSelectedState: AppState) => void): () => void;
        <U>(selector: (state: AppState) => U, listener: (selectedState: U, previousSelectedState: U) => void, options?: {
            equalityFn?: ((a: U, b: U) => boolean) | undefined;
            fireImmediately?: boolean;
        } | undefined): () => void;
    };
}>;
export {};
//# sourceMappingURL=appStore.d.ts.map