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
const operation = (data: object) => ({ operationId: 'local-id', ...data });

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

    await worker.emit(operation({ type: 'progress', phase: 'discovering', progress: 0.5 }));
    await worker.emit(
      operation({
        type: 'discovered',
        importKind: 'encounter-log',
        report,
        actors,
        diagnostics: [],
      }),
    );
    expect(worker.postMessage).toHaveBeenCalledWith({
      type: 'ack',
      operationId: 'local-id',
      batchId: -1,
    });

    await worker.emit(operation({ type: 'progress', phase: 'normalizing', progress: 0 }));

    const events = [{ type: 'cast', timestamp: 10 }];
    await worker.emit(operation({ type: 'batch', batchId: 0, fightId: 1, events }));
    expect(store.appendLocalEventChunk).toHaveBeenCalledWith('local-id', 1, events, 0);
    expect(worker.postMessage).toHaveBeenCalledWith({
      type: 'ack',
      operationId: 'local-id',
      batchId: 0,
    });

    await worker.emit(operation({ type: 'complete', diagnostics: [] }));
    await expect(importing).resolves.toBe('local-id');
    expect(store.updateLocalManifest.mock.calls.map((call) => call[1].status)).toEqual([
      'discovering',
      'normalizing',
      'persisting',
      'ready',
    ]);
    expect(store.updateLocalManifest.mock.calls[1][1]).toMatchObject({
      importKind: 'encounter-log',
    });
    expect(progress).toHaveBeenLastCalledWith({ phase: 'persisting', progress: 1 });
    expect(progress.mock.calls.map(([value]) => value.progress)).toEqual([0.175, 0.35, 0.9, 1]);
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

    await worker.emit(operation({ type: 'batch', batchId: 0, fightId: 1, events: [] }));

    await expect(importing).rejects.toThrow('quota');
    expect(worker.postMessage).not.toHaveBeenCalledWith({
      type: 'ack',
      operationId: 'local-id',
      batchId: 0,
    });
    expect(store.removeLocalReport).toHaveBeenCalledWith('local-id');
  });

  it('pauses for typed target-dummy input and resumes the same worker operation', async () => {
    const input = {
      playerGuid: 'Player-1',
      sessionId: 'session-1',
      simcProfile: '# SimC Addon profile',
    };
    const provideInput = vi.fn().mockResolvedValue(input);
    const controller = new AbortController();
    const importing = importLocalCombatLog(
      new File(['log'], 'combat.txt'),
      undefined,
      controller.signal,
      provideInput,
    );
    await vi.waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
    const worker = FakeWorker.instances[0];
    const request = { discovery: { players: [], sessions: [] }, diagnostics: [] };

    await worker.emit(operation({ type: 'target-dummy-input-required', requestId: 1, request }));

    expect(provideInput).toHaveBeenCalledWith(request);
    expect(worker.postMessage).toHaveBeenCalledWith({
      type: 'prepare-target-dummy',
      operationId: 'local-id',
      requestId: 1,
      input,
    });
    expect(store.updateLocalManifest.mock.calls.map((call) => call[1].status)).toEqual([
      'discovering',
    ]);

    controller.abort();
    await expect(importing).rejects.toMatchObject({ name: 'AbortError' });
    expect(store.removeLocalReport).toHaveBeenCalledWith('local-id');
  });

  it('persists a resumed target-dummy import with its manifest origin', async () => {
    const provideInput = vi.fn().mockResolvedValue({
      playerGuid: 'Player-1',
      sessionId: 'session-1',
      simcProfile: '# SimC Addon profile',
    });
    const importing = importLocalCombatLog(
      new File(['log'], 'combat.txt'),
      undefined,
      undefined,
      provideInput,
    );
    await vi.waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
    const worker = FakeWorker.instances[0];
    const request = { discovery: { players: [], sessions: [] }, diagnostics: [] };
    await worker.emit(operation({ type: 'target-dummy-input-required', requestId: 1, request }));
    await worker.emit(
      operation({
        type: 'target-dummy-prepared',
        requestId: 1,
        prepared: {},
      }),
    );
    await worker.emit(
      operation({
        type: 'discovered',
        importKind: 'target-dummy',
        report,
        actors,
        diagnostics: [],
      }),
    );
    const events = [{ type: 'combatantinfo', timestamp: 10 }];
    await worker.emit(operation({ type: 'batch', batchId: 0, fightId: 1, events }));
    await worker.emit(operation({ type: 'complete', diagnostics: [] }));

    await expect(importing).resolves.toBe('local-id');
    expect(store.updateLocalManifest.mock.calls[1][1]).toMatchObject({
      status: 'normalizing',
      importKind: 'target-dummy',
    });
    expect(store.appendLocalEventChunk).toHaveBeenCalledWith('local-id', 1, events, 0);
  });

  it('rejects an unhandled synthetic pause without leaving staged data', async () => {
    const importing = importLocalCombatLog(new File(['log'], 'combat.txt'));
    await vi.waitFor(() => expect(FakeWorker.instances).toHaveLength(1));

    await FakeWorker.instances[0].emit(
      operation({
        type: 'target-dummy-input-required',
        requestId: 1,
        request: { discovery: { players: [], sessions: [] }, diagnostics: [] },
      }),
    );

    await expect(importing).rejects.toMatchObject({ name: 'TargetDummyInputRequiredError' });
    expect(store.removeLocalReport).toHaveBeenCalledWith('local-id');
  });

  it('ignores stale worker messages from a different operation', async () => {
    const provideInput = vi.fn();
    const controller = new AbortController();
    const importing = importLocalCombatLog(
      new File(['log'], 'combat.txt'),
      undefined,
      controller.signal,
      provideInput,
    );
    await vi.waitFor(() => expect(FakeWorker.instances).toHaveLength(1));

    await FakeWorker.instances[0].emit({
      operationId: 'stale-id',
      type: 'target-dummy-input-required',
      requestId: 1,
      request: { discovery: { players: [], sessions: [] }, diagnostics: [] },
    });

    expect(provideInput).not.toHaveBeenCalled();
    expect(store.updateLocalManifest).toHaveBeenCalledTimes(1);
    controller.abort();
    await expect(importing).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('ignores stale batches and completion while normalization is active', async () => {
    const controller = new AbortController();
    const importing = importLocalCombatLog(
      new File(['log'], 'combat.txt'),
      undefined,
      controller.signal,
    );
    await vi.waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
    const worker = FakeWorker.instances[0];

    await worker.emit(
      operation({
        type: 'discovered',
        importKind: 'encounter-log',
        report,
        actors,
        diagnostics: [],
      }),
    );
    await worker.emit({
      operationId: 'stale-id',
      type: 'batch',
      batchId: 0,
      fightId: 1,
      events: [{ type: 'cast', timestamp: 10 }],
    });
    await worker.emit({ operationId: 'stale-id', type: 'complete', diagnostics: [] });

    expect(store.appendLocalEventChunk).not.toHaveBeenCalled();
    expect(store.updateLocalManifest.mock.calls.map((call) => call[1].status)).toEqual([
      'discovering',
      'normalizing',
    ]);
    expect(worker.terminate).not.toHaveBeenCalled();

    controller.abort();
    await expect(importing).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('cancels a resumed target-dummy import during normalization and ignores late completion', async () => {
    const controller = new AbortController();
    const provideInput = vi.fn().mockResolvedValue({
      playerGuid: 'Player-1',
      sessionId: 'session-1',
      simcProfile: '# SimC Addon profile',
    });
    const importing = importLocalCombatLog(
      new File(['log'], 'combat.txt'),
      undefined,
      controller.signal,
      provideInput,
    );
    await vi.waitFor(() => expect(FakeWorker.instances).toHaveLength(1));
    const worker = FakeWorker.instances[0];
    const request = { discovery: { players: [], sessions: [] }, diagnostics: [] };

    await worker.emit(operation({ type: 'target-dummy-input-required', requestId: 1, request }));
    await worker.emit(
      operation({
        type: 'discovered',
        importKind: 'target-dummy',
        report,
        actors,
        diagnostics: [],
      }),
    );
    controller.abort();
    await expect(importing).rejects.toMatchObject({ name: 'AbortError' });
    await worker.emit(operation({ type: 'complete', diagnostics: [] }));

    expect(store.updateLocalManifest.mock.calls.map((call) => call[1].status)).toEqual([
      'discovering',
      'normalizing',
    ]);
    expect(store.removeLocalReport).toHaveBeenCalledWith('local-id');
    expect(worker.terminate).toHaveBeenCalledOnce();
  });
});
