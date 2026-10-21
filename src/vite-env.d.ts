/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_SOURCE?: string;
  readonly VITE_LIVETENNIS_API_BASE_URL?: string;
  readonly VITE_LIVETENNIS_API_KEY?: string;
  readonly VITE_LIVETENNIS_DAILY_BUDGET?: string;
  readonly VITE_FEATURE_INJURIES?: string;
  readonly VITE_FEATURE_PLAYER_PHOTOS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
