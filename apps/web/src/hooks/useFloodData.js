// React Query hooks for flood data
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "../services/supabase";
import * as api from "../services/api";
import { useAppStore } from "../stores/appStore";
// Query keys
export const QUERY_KEYS = {
    floodZones: ["flood-zones"],
    floodStats: ["flood-stats"],
    alerts: (active) => ["alerts", active],
    payouts: (zoneId) => ["payouts", zoneId],
    verifications: (zoneId) => ["verifications", zoneId],
};
// ── Flood Zones ──────────────────────────────────────────────────────────────
export function useFloodZones() {
    return useQuery({
        queryKey: QUERY_KEYS.floodZones,
        queryFn: api.getFloodZones,
        staleTime: 2 * 60 * 1000, // 2 min
        refetchInterval: 5 * 60 * 1000, // Refetch every 5 min
    });
}
export function useFloodStats() {
    const setStats = useAppStore((s) => s.setStats);
    return useQuery({
        queryKey: QUERY_KEYS.floodStats,
        queryFn: api.getFloodStats,
        staleTime: 60 * 1000,
        select: (data) => {
            setStats(data);
            return data;
        },
    });
}
// ── Realtime zones via Supabase ──────────────────────────────────────────────
export function useRealtimeFloodZones() {
    const queryClient = useQueryClient();
    useEffect(() => {
        const channel = supabase
            .channel("flood-zones-realtime")
            .on("postgres_changes", { event: "*", schema: "public", table: "flood_zones" }, (payload) => {
            // Invalidate and refetch when zones change
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.floodZones });
            // If new critical/high zone, add to alerts
            if (payload.eventType === "INSERT") {
                const zone = payload.new;
                if (zone.severity === "critical" || zone.severity === "high") {
                    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts() });
                }
            }
        })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);
}
// ── Alerts ───────────────────────────────────────────────────────────────────
export function useAlerts(active) {
    const addAlert = useAppStore((s) => s.addAlert);
    const queryClient = useQueryClient();
    // Supabase realtime subscription
    useEffect(() => {
        const channel = supabase
            .channel("alerts-realtime")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "flood_alerts" }, (payload) => {
            const alert = payload.new;
            addAlert(alert);
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts() });
        })
            .subscribe();
        return () => {
            supabase.removeChannel(channel);
        };
    }, [addAlert, queryClient]);
    return useQuery({
        queryKey: QUERY_KEYS.alerts(active),
        queryFn: () => api.getAlerts(active),
        staleTime: 30 * 1000, // 30 sec
    });
}
export function useAcknowledgeAlert() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.acknowledgeAlert,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts() });
        },
    });
}
// ── Payouts ──────────────────────────────────────────────────────────────────
export function usePayouts(zoneId) {
    return useQuery({
        queryKey: QUERY_KEYS.payouts(zoneId),
        queryFn: () => api.getPayouts(zoneId),
        staleTime: 30 * 1000,
    });
}
export function useTriggerPayout() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.triggerPayout,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payouts() });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payouts(data.zoneId) });
        },
    });
}
// ── Community Verifications ──────────────────────────────────────────────────
export function useVerifications(zoneId) {
    return useQuery({
        queryKey: QUERY_KEYS.verifications(zoneId),
        queryFn: () => api.getVerifications(zoneId),
        enabled: !!zoneId,
    });
}
export function useSubmitVerification() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: api.submitVerification,
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.verifications(variables.zoneId),
            });
        },
    });
}
//# sourceMappingURL=useFloodData.js.map