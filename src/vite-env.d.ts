/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FREESOUND_CLIENT_ID: string;
  readonly VITE_FREESOUND_CLIENT_SECRET: string;
  readonly VITE_FREESOUND_API_TOKEN?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_DEBUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

