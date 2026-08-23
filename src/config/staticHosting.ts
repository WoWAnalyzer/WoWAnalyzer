const ensureTrailingSlash = (value: string) => {
  const withLeadingSlash = value.startsWith('/') ? value : `/${value}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
};

/** The public path Vite used for this build (for example `/WoWAnalyzer/`). */
export const basePath = ensureTrailingSlash(import.meta.env.BASE_URL || '/');

/** Resolve a file copied from `public/` without assuming the site is hosted at `/`. */
export const publicAsset = (path: string) => `${basePath}${path.replace(/^\/+/, '')}`;

export const staticHostingEnabled = import.meta.env.VITE_STATIC_HOST !== 'false';

/** WCL entry points are opt-in because API access can require deployment-specific licensing. */
export const wclIntegrationEnabled = import.meta.env.VITE_ENABLE_WCL === 'true';
