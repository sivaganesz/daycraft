/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the DayCraft API, without a path (e.g. https://daycraft-api.whitraworks.online). */
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
