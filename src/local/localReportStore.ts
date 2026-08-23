import type { AnyEvent } from 'parser/core/Events';
import type { PlayerDetails } from 'parser/core/Player';
import type Report from 'parser/core/Report';

import type { LocalDiagnostic } from './LocalCombatLogParser';

/**
 * Persisted normalized shapes are development-only until local reports ship.
 * Change this database name (or explicitly clear it) when those shapes change.
 */
export const LOCAL_DB_NAME = 'wowanalyzer-local-reports-final-v1';
export const LOCAL_DB_VERSION = 1;
export const LOCAL_SCHEMA_VERSION = 1;
export const LOCAL_PARSER_VERSION = 'retail-v22.7';

export type LocalImportStatus = 'staged' | 'discovering' | 'normalizing' | 'persisting' | 'ready';

export interface LocalManifest {
  id: string;
  schemaVersion: number;
  parserVersion: string;
  status: LocalImportStatus;
  report?: Report;
  players?: Record<number, PlayerDetails[]>;
  diagnostics: LocalDiagnostic[];
  createdAt: number;
  fileName?: string;
  fileSize?: number;
  importDurationMs?: number;
  approximateStoredSize?: number;
}

export interface ReadyLocalManifest extends LocalManifest {
  status: 'ready';
  report: Report;
  players: Record<number, PlayerDetails[]>;
}

interface EventRecord {
  key: string;
  reportId: string;
  fightId: number;
  minTimestamp: number;
  maxTimestamp: number;
  order: number;
  events: AnyEvent[];
}

export class LocalReportUnavailableError extends Error {
  constructor() {
    super('This local report is unavailable. Return to local imports and import the file again.');
    this.name = 'LocalReportUnavailableError';
  }
}

export class LocalReportQuotaError extends Error {
  constructor() {
    super('Browser storage is full. Free some space and import the combat log again.');
    this.name = 'LocalReportQuotaError';
  }
}

export class LocalReportStorageError extends Error {
  constructor(message = 'Browser storage for local reports could not be opened.') {
    super(message);
    this.name = 'LocalReportStorageError';
  }
}

const request = <T>(value: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    value.onsuccess = () => resolve(value.result);
    value.onerror = () => reject(value.error);
  });

const transactionDone = (transaction: IDBTransaction) =>
  new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
  });

const normalizeStorageError = (error: unknown) => {
  if (error instanceof DOMException && error.name === 'QuotaExceededError') {
    return new LocalReportQuotaError();
  }
  return error;
};

export function openLocalReportDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let value: IDBOpenDBRequest;
    try {
      value = indexedDB.open(LOCAL_DB_NAME, LOCAL_DB_VERSION);
    } catch {
      reject(new LocalReportStorageError());
      return;
    }
    value.onupgradeneeded = () => {
      const db = value.result;
      const manifests = db.createObjectStore('manifests', { keyPath: 'id' });
      manifests.createIndex('status', 'status');
      const events = db.createObjectStore('events', { keyPath: 'key' });
      events.createIndex('report', 'reportId');
      events.createIndex('report-fight-time', ['reportId', 'fightId', 'minTimestamp']);
    };
    value.onsuccess = () => resolve(value.result);
    value.onerror = () => reject(new LocalReportStorageError(value.error?.message));
    value.onblocked = () =>
      reject(new LocalReportStorageError('Browser storage upgrade was blocked.'));
  });
}

function assertReadyLocalManifest(
  manifest: LocalManifest | undefined,
): asserts manifest is ReadyLocalManifest {
  if (
    !manifest ||
    manifest.status !== 'ready' ||
    manifest.schemaVersion !== LOCAL_SCHEMA_VERSION ||
    manifest.parserVersion !== LOCAL_PARSER_VERSION ||
    !manifest.report ||
    !manifest.players
  ) {
    throw new LocalReportUnavailableError();
  }
}

export function requireReadyLocalManifest(manifest: LocalManifest | undefined): ReadyLocalManifest {
  assertReadyLocalManifest(manifest);
  return manifest;
}

export async function stageLocalReport(id: string, file?: { name: string; size: number }) {
  const db = await openLocalReportDb();
  try {
    const transaction = db.transaction('manifests', 'readwrite');
    transaction.objectStore('manifests').add({
      id,
      schemaVersion: LOCAL_SCHEMA_VERSION,
      parserVersion: LOCAL_PARSER_VERSION,
      status: 'staged',
      diagnostics: [],
      createdAt: Date.now(),
      fileName: file?.name,
      fileSize: file?.size,
    } satisfies LocalManifest);
    await transactionDone(transaction);
  } catch (error) {
    throw normalizeStorageError(error);
  } finally {
    db.close();
  }
}

export async function updateLocalManifest(id: string, patch: Partial<LocalManifest>) {
  const db = await openLocalReportDb();
  try {
    const transaction = db.transaction('manifests', 'readwrite');
    const store = transaction.objectStore('manifests');
    const current = (await request(store.get(id))) as LocalManifest | undefined;
    if (!current || current.status === 'ready') {
      throw new LocalReportUnavailableError();
    }
    const next = { ...current, ...patch } satisfies LocalManifest;
    if (next.status === 'ready') {
      requireReadyLocalManifest(next);
    }
    store.put(next);
    await transactionDone(transaction);
  } catch (error) {
    throw normalizeStorageError(error);
  } finally {
    db.close();
  }
}

export async function appendLocalEventChunk(
  id: string,
  fightId: number,
  events: AnyEvent[],
  order: number,
) {
  if (events.length === 0) return;
  const db = await openLocalReportDb();
  try {
    const transaction = db.transaction(['manifests', 'events'], 'readwrite');
    const manifest = (await request(transaction.objectStore('manifests').get(id))) as
      | LocalManifest
      | undefined;
    if (!manifest || manifest.status === 'ready') {
      transaction.abort();
      throw new LocalReportUnavailableError();
    }
    const timestamps = events.map((event) => event.timestamp);
    transaction.objectStore('events').add({
      key: `${id}:${fightId}:${order}`,
      reportId: id,
      fightId,
      minTimestamp: Math.min(...timestamps),
      maxTimestamp: Math.max(...timestamps),
      order,
      events,
    } satisfies EventRecord);
    await transactionDone(transaction);
  } catch (error) {
    throw normalizeStorageError(error);
  } finally {
    db.close();
  }
}

export async function getLocalReport(id: string): Promise<LocalManifest | undefined> {
  const db = await openLocalReportDb();
  try {
    return (await request(db.transaction('manifests').objectStore('manifests').get(id))) as
      | LocalManifest
      | undefined;
  } finally {
    db.close();
  }
}

export async function getReadyLocalReport(id: string): Promise<ReadyLocalManifest> {
  return requireReadyLocalManifest(await getLocalReport(id));
}

export async function getLocalEvents(
  id: string,
  fightId: number,
  start = Number.MIN_SAFE_INTEGER,
  end = Number.MAX_SAFE_INTEGER,
  actorId?: number,
): Promise<AnyEvent[]> {
  const db = await openLocalReportDb();
  try {
    const transaction = db.transaction(['events', 'manifests']);
    const manifest = requireReadyLocalManifest(
      (await request(transaction.objectStore('manifests').get(id))) as LocalManifest | undefined,
    );
    const records = (await request(
      transaction
        .objectStore('events')
        .index('report-fight-time')
        .getAll(IDBKeyRange.bound([id, fightId, Number.MIN_SAFE_INTEGER], [id, fightId, end])),
    )) as EventRecord[];
    const actorIds =
      actorId === undefined
        ? undefined
        : new Set([
            actorId,
            ...manifest.report.friendlyPets
              .filter((pet) => pet.petOwner === actorId)
              .map((pet) => pet.id),
          ]);
    return records
      .filter((record) => record.maxTimestamp >= start)
      .sort((left, right) => left.minTimestamp - right.minTimestamp || left.order - right.order)
      .flatMap((record) => record.events)
      .filter((event) => event.timestamp >= start && event.timestamp <= end)
      .filter(
        (event) =>
          actorIds === undefined ||
          actorIds.has(
            'sourceID' in event && typeof event.sourceID === 'number' ? event.sourceID : -1,
          ) ||
          actorIds.has(
            'targetID' in event && typeof event.targetID === 'number' ? event.targetID : -1,
          ),
      );
  } finally {
    db.close();
  }
}

export async function listLocalReports(): Promise<ReadyLocalManifest[]> {
  const db = await openLocalReportDb();
  try {
    const manifests = (await request(
      db.transaction('manifests').objectStore('manifests').getAll(),
    )) as LocalManifest[];
    return manifests.flatMap((manifest) => {
      try {
        return [requireReadyLocalManifest(manifest)];
      } catch {
        return [];
      }
    });
  } finally {
    db.close();
  }
}

export async function removeLocalReport(id: string): Promise<void> {
  const db = await openLocalReportDb();
  try {
    const transaction = db.transaction(['manifests', 'events'], 'readwrite');
    transaction.objectStore('manifests').delete(id);
    const eventIndex = transaction.objectStore('events').index('report');
    const cursorRequest = eventIndex.openKeyCursor(IDBKeyRange.only(id));
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (cursor) {
        transaction.objectStore('events').delete(cursor.primaryKey);
        cursor.continue();
      }
    };
    await transactionDone(transaction);
  } finally {
    db.close();
  }
}

export async function recoverLocalReports(): Promise<void> {
  const db = await openLocalReportDb();
  let manifests: LocalManifest[];
  try {
    manifests = (await request(
      db.transaction('manifests').objectStore('manifests').getAll(),
    )) as LocalManifest[];
  } finally {
    db.close();
  }
  await Promise.all(
    manifests
      .filter((manifest) => {
        try {
          requireReadyLocalManifest(manifest);
          return false;
        } catch {
          return true;
        }
      })
      .map((manifest) => removeLocalReport(manifest.id)),
  );
}
