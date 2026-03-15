/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAPBOX_TOKEN: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_SOLANA_NETWORK: string;
  readonly VITE_PROGRAM_ID: string;
  readonly VITE_ELEVENLABS_VOICE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
