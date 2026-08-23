describe('WCL build-time feature flag', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('hides the integration unless it is explicitly enabled', async () => {
    vi.stubEnv('VITE_ENABLE_WCL', 'false');

    const { wclIntegrationEnabled } = await import('./staticHosting');

    expect(wclIntegrationEnabled).toBe(false);
  });

  it('exposes the integration when enabled for the build', async () => {
    vi.stubEnv('VITE_ENABLE_WCL', 'true');

    const { wclIntegrationEnabled } = await import('./staticHosting');

    expect(wclIntegrationEnabled).toBe(true);
  });
});
