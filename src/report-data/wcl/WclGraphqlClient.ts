import {
  getWclAccessToken,
  WclAuthenticationError,
  WclConfigurationError,
  isWclConfigured,
} from './WclSession';

const WCL_USER_API = 'https://www.warcraftlogs.com/api/v2/user';
const MAX_RETRIES = 2;

interface GraphqlError {
  message: string;
}

interface GraphqlEnvelope<T> {
  data?: T;
  errors?: GraphqlError[];
}

export class WclGraphqlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WclGraphqlError';
  }
}

const delay = (milliseconds: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(resolve, milliseconds);
    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeout);
        reject(new DOMException('The operation was aborted.', 'AbortError'));
      },
      { once: true },
    );
  });

export async function queryWcl<T>(
  query: string,
  variables: Record<string, unknown>,
  options: { signal?: AbortSignal; retries?: number } = {},
): Promise<T> {
  if (!isWclConfigured()) throw new WclConfigurationError();
  const token = getWclAccessToken();
  if (!token) throw new WclAuthenticationError();

  const retries = options.retries ?? MAX_RETRIES;
  for (let attempt = 0; ; attempt += 1) {
    options.signal?.throwIfAborted();
    const response = await fetch(WCL_USER_API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
      signal: options.signal,
    });

    if (response.status === 401 || response.status === 403) {
      throw new WclAuthenticationError('Your Warcraft Logs session expired. Sign in again.');
    }
    if (response.status === 429 && attempt < retries) {
      const retryAfter = Number(response.headers.get('Retry-After'));
      await delay(
        Number.isFinite(retryAfter) ? retryAfter * 1000 : 500 * 2 ** attempt,
        options.signal,
      );
      continue;
    }
    if (!response.ok) {
      throw new WclGraphqlError(`Warcraft Logs returned HTTP ${response.status}.`);
    }

    const envelope = (await response.json()) as GraphqlEnvelope<T>;
    if (envelope.errors?.length) {
      throw new WclGraphqlError(envelope.errors.map((error) => error.message).join('\n'));
    }
    if (!envelope.data) throw new WclGraphqlError('Warcraft Logs returned no data.');
    return envelope.data;
  }
}
