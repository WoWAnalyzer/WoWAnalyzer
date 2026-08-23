/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

interface ImportMetaEnv {
  readonly VITE_BASE_PATH?: string;
  readonly VITE_STATIC_HOST?: string;
  readonly VITE_ENABLE_WCL?: string;
  readonly VITE_WCL_CLIENT_ID?: string;
  readonly VITE_WCL_REDIRECT_URI?: string;
  readonly VITE_PUBLISH_SOURCEMAPS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
