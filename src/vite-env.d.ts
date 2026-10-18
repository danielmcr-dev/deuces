/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_SOURCE?: string;
  readonly VITE_SPORTS_API_BASE_URL?: string;
  readonly VITE_SPORTS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
