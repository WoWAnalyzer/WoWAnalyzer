const store = vi.hoisted(() => ({
  appendLocalEventChunk: vi.fn(),
  removeLocalReport: vi.fn(),
  stageLocalReport: vi.fn(),
  updateLocalManifest: vi.fn(),
}));

vi.mock('./localReportStore', () => store);

import { importLocalCombatLog } from './LocalReportImport';

class FakeWorker {
  static instances: FakeWorker[] = [];
  onmessage?: (event: MessageEvent) => Promise<void> | void;
  onerror?: (event: ErrorEvent) => void;
  postMessage = vi.fn();
  terminate = vi.fn();

  constructor() {
    FakeWorker.instances.push(this);
  }

  emit(data: unknown) {
    return this.onmessage?.({ data } as MessageEvent);
  }
}

const report = {
  fights: [{ id: 1 }],
} as never;
const actors = [
  {
    id: 1,
    guid: 'Player-1',
    name: 'Ada',
    flags: 0,
    friendly: true,
    className: 'DeathKnight',
    fightIds: [1],
    fightDetails: { 1: { specID: 251, role: 'dps', combatant: {} } },
  },
];

describe('importLocalCombatLog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    FakeWorker.instances = [];
    store.stageLocalReport.mockResolvedValue(undefined);
    store.updateLocalManifest.mockResolvedValue(undefined);
    store.appendLocalEventChunk.mockResolvedValue(undefined);
    store.removeLocalReport.mockResolvedValue(undefined);
    vi.stubGlobal('Worker', FakeWorker);
    vi.stubGlobal('crypto', { randomUUID: () => 'local-id' });
  });

  it('persists one acknowledged batch at a time and exposes ready only at completion', async () => {
    const progress = vi.fn();
    const importing = importLocalCombatLog(new File(['log'], 'combat.txt'), progress);
    await vi.waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
    const worker = FakeWorker.instances[0];

    await worker.emit({ type: 'discovered', report, actors, diagnostics: [] });
    expect(worker.postMessage).toHaveBeenCalledWith({ type: 'ack', batchId: -1 });

    const events = [{ type: 'cast', timestamp: 10 }];
    await worker.emit({ type: 'batch', batchId: 0, fightId: 1, events });
    expect(store.appendLocalEventChunk).toHaveBeenCalledWith('local-id', 1, events, 0);
    expect(worker.postMessage).toHaveBeenCalledWith({ type: 'ack', batchId: 0 });

    await worker.emit({ type: 'complete', diagnostics: [] });
    await expect(importing).resolves.toBe('local-id');
    expect(store.updateLocalManifest.mock.calls.map((call) => call[1].status)).toEqual([
      'discovering',
      'normalizing',
      'persisting',
      'ready',
    ]);
    expect(progress).toHaveBeenLastCalledWith({ phase: 'persisting', progress: 1 });
    expect(worker.terminate).toHaveBeenCalledOnce();
  });

  it('rejects promptly on abort and removes staged data', async () => {
    const controller = new AbortController();
    const importing = importLocalCombatLog(
      new File(['log'], 'combat.txt'),
      undefined,
      controller.signal,
    );
    await vi.waitFor(() => expect(FakeWorker.instances).toHaveLength(1));

    controller.abort();

    await expect(importing).rejects.toMatchObject({ name: 'AbortError' });
    expect(FakeWorker.instances[0].terminate).toHaveBeenCalledOnce();
    expect(store.removeLocalReport).toHaveBeenCalledWith('local-id');
  });

  it('removes staged data when persistence fails and does not acknowledge the batch', async () => {
    store.appendLocalEventChunk.mockRejectedValueOnce(new Error('quota'));
    const importing = importLocalCombatLog(new File(['log'], 'combat.txt'));
    await vi.waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
    const worker = FakeWorker.instances[0];

    await worker.emit({ type: 'batch', batchId: 0, fightId: 1, events: [] });

    await expect(importing).rejects.toThrow('quota');
    expect(worker.postMessage).not.toHaveBeenCalledWith({ type: 'ack', batchId: 0 });
    expect(store.removeLocalReport).toHaveBeenCalledWith('local-id');
  });
});
