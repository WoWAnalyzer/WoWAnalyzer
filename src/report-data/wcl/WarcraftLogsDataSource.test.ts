import type { PlayerDetails } from 'parser/core/Player';
import type Report from 'parser/core/Report';

const mocks = vi.hoisted(() => ({
  fetchEvents: vi.fn(),
  fetchFights: vi.fn(),
  makeCharacterApiUrl: vi.fn(() => '/character-profile'),
}));

vi.mock('common/fetchWclApi', () => ({
  fetchEvents: mocks.fetchEvents,
  fetchFights: mocks.fetchFights,
}));
vi.mock('common/makeApiUrl', () => ({ makeCharacterApiUrl: mocks.makeCharacterApiUrl }));

import { WarcraftLogsDataSource } from './WarcraftLogsDataSource';

const locator = { kind: 'warcraft-logs', code: 'report-code', isAnonymous: false } as const;
const source = () => new WarcraftLogsDataSource(locator);

describe('WarcraftLogsDataSource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('forwards refresh and attaches the WCL locator', async () => {
    mocks.fetchFights.mockResolvedValue({ title: 'Report' });

    await expect(source().loadReport({ refresh: true })).resolves.toMatchObject({
      title: 'Report',
      code: 'report-code',
      isAnonymous: false,
      locator,
    });
    expect(mocks.fetchFights).toHaveBeenCalledWith('report-code', true);
  });

  it('preserves the players endpoint and response shape', async () => {
    const players = [{ id: 7, name: 'Player' }];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ players }) }));

    await expect(source().loadPlayers(12)).resolves.toBe(players);
    expect(fetch).toHaveBeenCalledWith('/api/v2/report/report-code/fight/12/players');
  });

  it('forwards complete event query options without a default page cap', async () => {
    const onProgress = vi.fn();
    const signal = new AbortController().signal;
    mocks.fetchEvents.mockResolvedValue([]);

    await source().loadEvents({
      fightId: 4,
      start: 100,
      end: 900,
      actorId: 22,
      onProgress,
      signal,
    });

    expect(mocks.fetchEvents).toHaveBeenCalledWith(
      'report-code',
      100,
      900,
      22,
      undefined,
      expect.objectContaining({ onProgress, signal }),
    );
    expect(mocks.fetchEvents.mock.calls[0][5].maxPages).toBeUndefined();
  });

  it('forwards filters and an explicit page cap for filtered operations', async () => {
    mocks.fetchEvents.mockResolvedValue([]);

    await source().loadFilteredEvents!({
      fightId: 4,
      start: 100,
      end: 900,
      filter: 'type="cast"',
      maxPages: 40,
    });

    expect(mocks.fetchEvents).toHaveBeenCalledWith(
      'report-code',
      100,
      900,
      undefined,
      'type="cast"',
      expect.objectContaining({ maxPages: 40 }),
    );
  });

  it('uses exported character fields and skips the China API', async () => {
    const player = { guid: 123, name: 'Player' } as PlayerDetails;
    const report = {
      gameVersion: 1,
      exportedCharacters: [{ id: 123, name: 'Player', region: 'eu', server: 'Silvermoon' }],
    } as Report;
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ name: 'Player' }) }),
    );

    await expect(source().loadCharacterProfile!(report, player)).resolves.toEqual({
      name: 'Player',
    });
    expect(mocks.makeCharacterApiUrl).toHaveBeenCalledWith(
      123,
      'eu',
      'Silvermoon',
      'Player',
      false,
    );

    const china = {
      ...report,
      exportedCharacters: [{ id: 123, name: 'Player', region: 'cn', server: 'Realm' }],
    } as Report;
    vi.mocked(fetch).mockClear();
    await expect(source().loadCharacterProfile!(china, player)).resolves.toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
});
