// Global app store — Zustand
import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import type { FloodAlert, FloodStats } from "@floodshield/shared";

interface WalletState {
  address: string | null;
  balance: bigint | null;
  isConnecting: boolean;
  isConnected: boolean;
}

interface AppState {
  // Wallet
  wallet: WalletState;
  setWallet: (wallet: Partial<WalletState>) => void;
  disconnectWallet: () => void;

  // Active alerts
  activeAlerts: FloodAlert[];
  setActiveAlerts: (alerts: FloodAlert[]) => void;
  addAlert: (alert: FloodAlert) => void;
  dismissAlert: (alertId: string) => void;

  // Stats
  stats: FloodStats | null;
  setStats: (stats: FloodStats) => void;

  // UI
  selectedZoneId: string | null;
  setSelectedZoneId: (id: string | null) => void;

  mapStyle: "dark" | "satellite" | "streets";
  setMapStyle: (style: AppState["mapStyle"]) => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Demo mode (when real satellite data unavailable)
  isDemoMode: boolean;
  setDemoMode: (demo: boolean) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    subscribeWithSelector((set) => ({
      wallet: {
        address: null,
        balance: null,
        isConnecting: false,
        isConnected: false,
      },
      setWallet: (wallet) =>
        set((s) => ({ wallet: { ...s.wallet, ...wallet } }), false, "setWallet"),
      disconnectWallet: () =>
        set(
          { wallet: { address: null, balance: null, isConnecting: false, isConnected: false } },
          false,
          "disconnectWallet",
        ),

      activeAlerts: [],
      setActiveAlerts: (alerts) => set({ activeAlerts: alerts }, false, "setActiveAlerts"),
      addAlert: (alert) =>
        set(
          (s) => ({ activeAlerts: [alert, ...s.activeAlerts.slice(0, 9)] }),
          false,
          "addAlert",
        ),
      dismissAlert: (alertId) =>
        set(
          (s) => ({ activeAlerts: s.activeAlerts.filter((a) => a.id !== alertId) }),
          false,
          "dismissAlert",
        ),

      stats: null,
      setStats: (stats) => set({ stats }, false, "setStats"),

      selectedZoneId: null,
      setSelectedZoneId: (id) => set({ selectedZoneId: id }, false, "setSelectedZoneId"),

      mapStyle: "dark",
      setMapStyle: (mapStyle) => set({ mapStyle }, false, "setMapStyle"),

      sidebarOpen: true,
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }, false, "setSidebarOpen"),

      isDemoMode: false,
      setDemoMode: (isDemoMode) => set({ isDemoMode }, false, "setDemoMode"),
    })),
    { name: "floodshield-store" },
  ),
);
