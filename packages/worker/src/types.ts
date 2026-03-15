// Worker Env bindings type — floodshield-main (includes ElevenLabs)
export interface Env {
  ENVIRONMENT: string;

  // Supabase
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;

  // Solana
  SOLANA_RPC_URL: string;
  PAYOUT_AUTHORITY_PRIVATE_KEY: string;
  PROGRAM_ID: string;

  // ElevenLabs TTS
  ELEVENLABS_API_KEY: string;
  ELEVENLABS_VOICE_ID: string; // Vietnamese voice ID

  // KV caches
  FLOOD_CACHE: KVNamespace;
  VOICE_CACHE: KVNamespace; // Audio file cache (72h TTL)

  // R2 storage (GeoJSON + pre-generated audio)
  FLOOD_GEOJSON: R2Bucket;
}
