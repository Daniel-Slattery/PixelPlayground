interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  // define other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
