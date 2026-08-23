import { getWclAccessToken, processWclCallback, WclAuthenticationError } from './WclSession';

const key = (suffix: string) => `wowanalyzer:wcl-pkce:${suffix}`;

describe('WclSession callback', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.unstubAllEnvs();
    vi.stubEnv('VITE_WCL_CLIENT_ID', 'public-client');
    vi.stubEnv('VITE_WCL_REDIRECT_URI', 'https://example.test/WoWAnalyzer/');
    window.history.replaceState(null, '', '/');
  });

  it('ignores normal application loads', async () => {
    await expect(processWclCallback()).resolves.toEqual({ handled: false });
  });

  it('rejects a mismatched state and clears one-time PKCE values', async () => {
    sessionStorage.setItem(key('state'), 'expected');
    sessionStorage.setItem(key('verifier'), 'verifier');
    window.history.replaceState(null, '', '/?code=code&state=unexpected');

    await expect(processWclCallback()).rejects.toBeInstanceOf(WclAuthenticationError);
    expect(sessionStorage.getItem(key('state'))).toBeNull();
    expect(sessionStorage.getItem(key('verifier'))).toBeNull();
  });

  it('exchanges a code without a client secret and stores a session-scoped token', async () => {
    sessionStorage.setItem(key('state'), 'expected');
    sessionStorage.setItem(key('verifier'), 'verifier');
    sessionStorage.setItem(key('return-to'), '/report/abcdefghijklmnop');
    window.history.replaceState(null, '', '/?code=code&state=expected');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ access_token: 'token', expires_in: 3600 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(processWclCallback()).resolves.toEqual({
      handled: true,
      returnTo: '/report/abcdefghijklmnop',
    });
    expect(getWclAccessToken()).toBe('token');
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect(String(request.body)).toContain('client_id=public-client');
    expect(String(request.body)).toContain('code_verifier=verifier');
    expect(String(request.body)).not.toContain('client_secret');
  });
});
