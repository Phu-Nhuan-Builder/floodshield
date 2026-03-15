// React Query hooks for flood data
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "../services/supabase";
import * as api from "../services/api";
import { useAppStore } from "../stores/appStore";
import type { FloodZone, FloodAlert, AidPayout } from "@floodshield/shared";

// Query keys
export const QUERY_KEYS = {
  floodZones: ["flood-zones"] as const,
  floodStats: ["flood-stats"] as const,
  alerts: (active?: boolean) => ["alerts", active] as const,
  payouts: (zoneId?: string) => ["payouts", zoneId] as const,
  verifications: (zoneId: string) => ["verifications", zoneId] as const,
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
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "flood_zones" },
        (payload) => {
          // Invalidate and refetch when zones change
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.floodZones });

          // If new critical/high zone, add to alerts
          if (payload.eventType === "INSERT") {
            const zone = payload.new as FloodZone;
            if (zone.severity === "critical" || zone.severity === "high") {
              queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts() });
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

// ── Alerts ───────────────────────────────────────────────────────────────────

export function useAlerts(active?: boolean) {
  const addAlert = useAppStore((s) => s.addAlert);
  const queryClient = useQueryClient();

  // Supabase realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("alerts-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "flood_alerts" },
        (payload) => {
          const alert = payload.new as FloodAlert;
          addAlert(alert);
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alerts() });
        },
      )
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

export function usePayouts(zoneId?: string) {
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
    onSuccess: (data: AidPayout) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payouts() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.payouts(data.zoneId) });
    },
  });
}

// ── Community Verifications ──────────────────────────────────────────────────

export function useVerifications(zoneId: string) {
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
