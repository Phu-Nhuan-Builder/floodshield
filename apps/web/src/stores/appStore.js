// Global app store — Zustand
import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
export const useAppStore = create()(devtools(subscribeWithSelector((set) => ({
    wallet: {
        address: null,
        balance: null,
        isConnecting: false,
        isConnected: false,
    },
    setWallet: (wallet) => set((s) => ({ wallet: { ...s.wallet, ...wallet } }), false, "setWallet"),
    disconnectWallet: () => set({ wallet: { address: null, balance: null, isConnecting: false, isConnected: false } }, false, "disconnectWallet"),
    activeAlerts: [],
    setActiveAlerts: (alerts) => set({ activeAlerts: alerts }, false, "setActiveAlerts"),
    addAlert: (alert) => set((s) => ({ activeAlerts: [alert, ...s.activeAlerts.slice(0, 9)] }), false, "addAlert"),
    dismissAlert: (alertId) => set((s) => ({ activeAlerts: s.activeAlerts.filter((a) => a.id !== alertId) }), false, "dismissAlert"),
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
})), { name: "floodshield-store" }));
//# sourceMappingURL=appStore.js.map