const mocks = vi.hoisted(() => ({
  loadReport: vi.fn(),
  loadPlayers: vi.fn(),
  loadEvents: vi.fn(),
  loadTable: vi.fn(),
}));

vi.mock('./WclReportClient', () => ({
  WclReportClient: class {
    loadReport = mocks.loadReport;
    loadPlayers = mocks.loadPlayers;
    loadEvents = mocks.loadEvents;
    loadTable = mocks.loadTable;
  },
}));

import { WarcraftLogsDataSource } from './WarcraftLogsDataSource';

const locator = { kind: 'warcraft-logs', code: 'report-code', isAnonymous: false } as const;
const source = () => new WarcraftLogsDataSource(locator);

describe('WarcraftLogsDataSource', () => {
  beforeEach(() => vi.clearAllMocks());

  it('loads reports through the browser GraphQL client', async () => {
    const report = { title: 'Report', gameVersion: 1, locator };
    mocks.loadReport.mockResolvedValue(report);
    await expect(source().loadReport()).resolves.toBe(report);
    expect(mocks.loadReport).toHaveBeenCalledOnce();
  });

  it('loads players without a root-relative application-server endpoint', async () => {
    const players = [{ id: 7, name: 'Player' }];
    mocks.loadPlayers.mockResolvedValue(players);
    await expect(source().loadPlayers(12)).resolves.toBe(players);
    expect(mocks.loadPlayers).toHaveBeenCalledWith(12);
  });

  it('forwards event pagination, cancellation and progress options', async () => {
    const onProgress = vi.fn();
    const signal = new AbortController().signal;
    mocks.loadEvents.mockResolvedValue([]);
    await source().loadEvents({
      fightId: 4,
      start: 100,
      end: 900,
      actorId: 22,
      onProgress,
      signal,
    });
    expect(mocks.loadEvents).toHaveBeenCalledWith({
      fightId: 4,
      start: 100,
      end: 900,
      actorId: 22,
      maxPages: undefined,
      onProgress,
      signal,
    });
  });

  it('keeps filtered event transport at the source boundary', async () => {
    mocks.loadEvents.mockResolvedValue([]);
    await source().loadFilteredEvents!({
      fightId: 4,
      start: 100,
      end: 900,
      filter: 'type="cast"',
      maxPages: 40,
    });
    expect(mocks.loadEvents).toHaveBeenCalledWith(
      expect.objectContaining({ filter: 'type="cast"', maxPages: 40 }),
    );
  });
});
