import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import { EventType, type AnyEvent } from 'parser/core/Events';
import type Report from 'parser/core/Report';

import {
  appendLocalEventChunk,
  getLocalEvents,
  getLocalReport,
  getReadyLocalReport,
  listLocalReports,
  LOCAL_PARSER_VERSION,
  LOCAL_SCHEMA_VERSION,
  openLocalReportDb,
  recoverLocalReports,
  removeLocalReport,
  requireReadyLocalManifest,
  stageLocalReport,
  updateLocalManifest,
} from './localReportStore';

const report = {
  locator: { kind: 'local', id: 'report' },
  code: 'report',
  friendlyPets: [{ id: 2, petOwner: 1 }],
} as Report;

const sourceEvent = (timestamp: number, sourceID: number): AnyEvent =>
  ({ type: EventType.Cast, timestamp, sourceID }) as AnyEvent;

const makeReady = async (id = 'report') => {
  await stageLocalReport(id);
  await updateLocalManifest(id, {
    status: 'normalizing',
    report: { ...report, code: id, locator: { kind: 'local', id } },
    players: { 1: [] },
  });
  await appendLocalEventChunk(
    id,
    1,
    [sourceEvent(100, 1), sourceEvent(200, 2), sourceEvent(300, 3)],
    0,
  );
  await updateLocalManifest(id, { status: 'persisting' });
  await updateLocalManifest(id, { status: 'ready' });
};

describe('localReportStore', () => {
  beforeEach(() => {
    vi.stubGlobal('indexedDB', new IDBFactory());
    vi.stubGlobal('IDBKeyRange', IDBKeyRange);
  });

  it('creates the fresh final schema and indexes', async () => {
    const db = await openLocalReportDb();
    expect([...db.objectStoreNames]).toEqual(['events', 'manifests']);
    const transaction = db.transaction('events');
    expect([...transaction.objectStore('events').indexNames]).toEqual([
      'report',
      'report-fight-time',
    ]);
    db.close();
  });

  it('stages, validates, reads, filters, lists, and deletes a report', async () => {
    await makeReady();

    await expect(getReadyLocalReport('report')).resolves.toMatchObject({ status: 'ready' });
    await expect(listLocalReports()).resolves.toHaveLength(1);
    await expect(getLocalEvents('report', 1, 150, 250)).resolves.toMatchObject([
      { timestamp: 200 },
    ]);
    await expect(getLocalEvents('report', 1, 0, 1000, 1)).resolves.toMatchObject([
      { sourceID: 1 },
      { sourceID: 2 },
    ]);

    await removeLocalReport('report');
    await expect(getLocalReport('report')).resolves.toBeUndefined();
    await expect(listLocalReports()).resolves.toEqual([]);
  });

  it('recovers incomplete imports before listing local data', async () => {
    await stageLocalReport('incomplete');
    await makeReady('ready');

    await recoverLocalReports();

    await expect(getLocalReport('incomplete')).resolves.toBeUndefined();
    await expect(listLocalReports()).resolves.toMatchObject([{ id: 'ready' }]);
  });

  it('rejects manifests with missing fields or incompatible versions', () => {
    expect(() =>
      requireReadyLocalManifest({
        id: 'invalid',
        schemaVersion: LOCAL_SCHEMA_VERSION,
        parserVersion: LOCAL_PARSER_VERSION,
        status: 'ready',
        diagnostics: [],
        createdAt: 0,
      }),
    ).toThrow('unavailable');
    expect(() =>
      requireReadyLocalManifest({
        id: 'invalid',
        schemaVersion: LOCAL_SCHEMA_VERSION + 1,
        parserVersion: LOCAL_PARSER_VERSION,
        status: 'ready',
        report,
        players: {},
        diagnostics: [],
        createdAt: 0,
      }),
    ).toThrow('unavailable');
  });
});
