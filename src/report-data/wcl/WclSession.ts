import { wclIntegrationEnabled } from 'config/staticHosting';

const STORAGE_PREFIX = 'wowanalyzer:wcl-pkce:';
const VERIFIER_KEY = `${STORAGE_PREFIX}verifier`;
const STATE_KEY = `${STORAGE_PREFIX}state`;
const RETURN_TO_KEY = `${STORAGE_PREFIX}return-to`;
const TOKEN_KEY = `${STORAGE_PREFIX}token`;

const AUTHORIZE_URL = 'https://www.warcraftlogs.com/oauth/authorize';
const TOKEN_URL = 'https://www.warcraftlogs.com/oauth/token';

interface StoredToken {
  accessToken: string;
  expiresAt: number;
}

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
}

export class WclConfigurationError extends Error {
  constructor(message = 'Warcraft Logs is not configured for this static build.') {
    super(message);
    this.name = 'WclConfigurationError';
  }
}

export class WclAuthenticationError extends Error {
  constructor(message = 'Sign in to Warcraft Logs to analyze hosted reports.') {
    super(message);
    this.name = 'WclAuthenticationError';
  }
}

export const getWclClientId = () => import.meta.env.VITE_WCL_CLIENT_ID?.trim() || undefined;

export const getWclRedirectUri = () => {
  const configured = import.meta.env.VITE_WCL_REDIRECT_URI?.trim();
  if (configured) return configured;
  if (typeof window === 'undefined') return undefined;
  return new URL(import.meta.env.BASE_URL || '/', window.location.origin).toString();
};

export const isWclConfigured = () =>
  wclIntegrationEnabled && Boolean(getWclClientId() && getWclRedirectUri());

const randomUrlSafe = (bytes: number) => {
  const value = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...value))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const sha256Challenge = async (verifier: string) => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const readToken = (): StoredToken | undefined => {
  const raw = sessionStorage.getItem(TOKEN_KEY);
  if (!raw) return undefined;
  try {
    const token = JSON.parse(raw) as StoredToken;
    if (!token.accessToken || token.expiresAt <= Date.now() + 30_000) {
      sessionStorage.removeItem(TOKEN_KEY);
      return undefined;
    }
    return token;
  } catch {
    sessionStorage.removeItem(TOKEN_KEY);
    return undefined;
  }
};

export const getWclAccessToken = () => readToken()?.accessToken;
export const hasWclSession = () => Boolean(readToken());

export const logoutWcl = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(RETURN_TO_KEY);
};

/** Start the browser-safe OAuth flow. No client secret is used or stored. */
export const beginWclAuthorization = async (returnTo = '/') => {
  const clientId = getWclClientId();
  const redirectUri = getWclRedirectUri();
  if (!clientId || !redirectUri) throw new WclConfigurationError();

  const verifier = randomUrlSafe(72);
  const state = randomUrlSafe(32);
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);
  sessionStorage.setItem(RETURN_TO_KEY, returnTo.startsWith('/') ? returnTo : '/');

  const url = new URL(AUTHORIZE_URL);
  url.search = new URLSearchParams({
    client_id: clientId,
    code_challenge: await sha256Challenge(verifier),
    code_challenge_method: 'S256',
    state,
    redirect_uri: redirectUri,
    response_type: 'code',
  }).toString();
  window.location.assign(url);
};

export interface WclCallbackResult {
  handled: boolean;
  returnTo?: string;
}

/** Process OAuth query parameters before the hash router selects its route. */
export const processWclCallback = async (): Promise<WclCallbackResult> => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const callbackError = params.get('error');
  if (!code && !callbackError) return { handled: false };

  const expectedState = sessionStorage.getItem(STATE_KEY);
  const state = params.get('state');
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  const returnTo = sessionStorage.getItem(RETURN_TO_KEY) ?? '/';
  const clientId = getWclClientId();
  const redirectUri = getWclRedirectUri();

  try {
    if (callbackError) {
      throw new WclAuthenticationError(
        params.get('error_description') || `Warcraft Logs authorization failed: ${callbackError}`,
      );
    }
    if (!code) throw new WclAuthenticationError('Warcraft Logs returned no authorization code.');
    if (!state || !expectedState || state !== expectedState) {
      throw new WclAuthenticationError('Warcraft Logs sign-in state did not match. Please retry.');
    }
    if (!verifier || !clientId || !redirectUri) {
      throw new WclAuthenticationError('Warcraft Logs sign-in expired. Please retry.');
    }

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        code_verifier: verifier,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code,
      }),
    });
    const json = (await response.json()) as TokenResponse;
    if (!response.ok || !json.access_token) {
      throw new WclAuthenticationError(
        json.error_description || json.error || 'Warcraft Logs token exchange failed.',
      );
    }
    sessionStorage.setItem(
      TOKEN_KEY,
      JSON.stringify({
        accessToken: json.access_token,
        expiresAt: Date.now() + Math.max(1, json.expires_in ?? 3600) * 1000,
      } satisfies StoredToken),
    );
    return { handled: true, returnTo };
  } finally {
    sessionStorage.removeItem(VERIFIER_KEY);
    sessionStorage.removeItem(STATE_KEY);
    sessionStorage.removeItem(RETURN_TO_KEY);
  }
};
