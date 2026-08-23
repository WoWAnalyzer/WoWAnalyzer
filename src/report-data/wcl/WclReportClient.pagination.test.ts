const queryWcl = vi.hoisted(() => vi.fn());
vi.mock('./WclGraphqlClient', () => ({ queryWcl }));

import { WclReportClient } from './WclReportClient';

describe('WclReportClient event pagination', () => {
  beforeEach(() => queryWcl.mockReset());

  it('paginates monotonically and reports completion', async () => {
    queryWcl
      .mockResolvedValueOnce({
        reportData: {
          report: { events: { data: [{ type: 'cast', timestamp: 100 }], nextPageTimestamp: 500 } },
        },
      })
      .mockResolvedValueOnce({
        reportData: { report: { events: { data: [{ type: 'cast', timestamp: 600 }] } } },
      });
    const progress = vi.fn();
    const client = new WclReportClient({
      kind: 'warcraft-logs',
      code: 'abcdefghijklmnop',
      isAnonymous: false,
    });

    await expect(
      client.loadEvents({ fightId: 4, start: 0, end: 1_000, onProgress: progress }),
    ).resolves.toHaveLength(2);
    expect(queryWcl.mock.calls[1][1]).toMatchObject({ start: 500, fightIds: [4] });
    expect(progress).toHaveBeenLastCalledWith(1);
  });

  it('rejects pagination that does not advance', async () => {
    queryWcl.mockResolvedValue({
      reportData: { report: { events: { data: [], nextPageTimestamp: 100 } } },
    });
    const client = new WclReportClient({
      kind: 'warcraft-logs',
      code: 'abcdefghijklmnop',
      isAnonymous: false,
    });
    await expect(client.loadEvents({ fightId: 4, start: 100, end: 1_000 })).rejects.toThrow(
      'did not advance',
    );
  });
});
