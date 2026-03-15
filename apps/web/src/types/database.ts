// Auto-generated Supabase database types
// Run: supabase gen types typescript --project-id <id> > src/types/database.ts

export type Database = {
  public: {
    Tables: {
      flood_zones: {
        Row: {
          id: string;
          province: string;
          district: string;
          severity: "low" | "medium" | "high" | "critical";
          flood_index: number;
          flooded_area_km2: number;
          detected_at: string;
          sentinel_item_id: string;
          geometry: unknown;
          confidence: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["flood_zones"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["flood_zones"]["Insert"]>;
      };
      flood_alerts: {
        Row: {
          id: string;
          zone_id: string;
          province: string;
          district: string;
          severity: "low" | "medium" | "high" | "critical";
          message: string;
          message_vi: string;
          expires_at: string;
          notifications_sent: number;
          acknowledged_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["flood_alerts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["flood_alerts"]["Insert"]>;
      };
      aid_payouts: {
        Row: {
          id: string;
          zone_id: string;
          province: string;
          recipient_address: string;
          recipient_name: string;
          amount: number;
          aid_type: "rice_voucher" | "fertilizer_voucher" | "cash";
          tx_signature: string | null;
          status: "pending" | "processing" | "confirmed" | "failed";
          triggered_at: string;
          confirmed_at: string | null;
          block_height: number | null;
        };
        Insert: Omit<Database["public"]["Tables"]["aid_payouts"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["aid_payouts"]["Insert"]>;
      };
      community_verifications: {
        Row: {
          id: string;
          zone_id: string;
          submitter_address: string;
          submitter_name: string;
          image_url: string;
          gps_lat: number;
          gps_lon: number;
          observed_severity: "low" | "medium" | "high" | "critical";
          notes: string;
          on_chain_signature: string | null;
          verified_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["community_verifications"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["community_verifications"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
