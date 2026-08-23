import type { AnyEvent } from 'parser/core/Events';
import type Report from 'parser/core/Report';

import type { LocalActor, LocalDiagnostic } from './LocalCombatLogParser';
import {
  appendLocalEventChunk,
  removeLocalReport,
  stageLocalReport,
  updateLocalManifest,
} from './localReportStore';

export interface ImportProgress {
  phase: 'discovering' | 'normalizing' | 'persisting';
  progress: number;
}

type WorkerMessage =
  | { type: 'progress'; phase: 'discovering' | 'normalizing'; progress: number }
  | {
      type: 'discovered';
      report: Report;
      actors: LocalActor[];
      diagnostics: LocalDiagnostic[];
    }
  | { type: 'batch'; batchId: number; fightId: number; events: AnyEvent[] }
  | { type: 'complete'; diagnostics: LocalDiagnostic[] }
  | { type: 'error'; name?: string; message: string; diagnostics?: LocalDiagnostic[] };

const abortError = () => new DOMException('Import cancelled', 'AbortError');

const players = (report: Report, actors: LocalActor[]) =>
  Object.fromEntries(
    report.fights.map((fight) => [
      fight.id,
      actors.flatMap((actor) => {
        const details = actor.fightDetails[fight.id];
        if (
          !actor.friendly ||
          actor.pet ||
          !actor.guid.startsWith('Player-') ||
          !actor.fightIds.includes(fight.id) ||
          !details?.role
        ) {
          return [];
        }
        return [
          {
            id: actor.id,
            name: actor.name,
            server: '',
            region: '',
            className: details.className ?? 'Unknown',
            specID: details.specID,
            role: details.role,
            guid: actor.id,
            ilvl: undefined,
          },
        ];
      }),
    ]),
  );

export async function importLocalCombatLog(
  file: File,
  onProgress?: (progress: ImportProgress) => void,
  signal?: AbortSignal,
): Promise<string> {
  signal?.throwIfAborted();
  const id = crypto.randomUUID();
  const importStartedAt = performance.now();
  let approximateStoredSize = 0;
  let staged = false;
  let worker: Worker | undefined;
  let closed = false;
  let rejectImport: ((reason: unknown) => void) | undefined;
  let lastProgress = 0;

  const emitProgress = (phase: ImportProgress['phase'], phaseProgress: number) => {
    const bounded = Math.min(1, Math.max(0, phaseProgress));
    const overall =
      phase === 'discovering'
        ? bounded * 0.35
        : phase === 'normalizing'
          ? 0.35 + bounded * 0.55
          : 0.9 + bounded * 0.1;
    lastProgress = Math.max(lastProgress, overall);
    onProgress?.({ phase, progress: lastProgress });
  };

  const close = () => {
    if (closed) return false;
    closed = true;
    worker?.terminate();
    return true;
  };
  const abort = () => {
    if (close()) {
      rejectImport?.(abortError());
    }
  };

  try {
    await stageLocalReport(id, { name: file.name, size: file.size });
    staged = true;
    await updateLocalManifest(id, { status: 'discovering' });
    signal?.addEventListener('abort', abort, { once: true });
    signal?.throwIfAborted();

    const result = await new Promise<string>((resolve, reject) => {
      rejectImport = reject;
      worker = new Worker(new URL('./localCombatLog.worker.ts', import.meta.url), {
        type: 'module',
      });

      worker.onmessage = async ({ data }: MessageEvent<WorkerMessage>) => {
        if (closed) return;
        try {
          switch (data.type) {
            case 'progress':
              emitProgress(data.phase, data.progress);
              break;
            case 'discovered':
              await updateLocalManifest(id, {
                status: 'normalizing',
                report: data.report,
                players: players(data.report, data.actors),
                diagnostics: data.diagnostics,
              });
              if (!closed) {
                worker?.postMessage({ type: 'ack', batchId: -1 });
              }
              break;
            case 'batch':
              approximateStoredSize += JSON.stringify(data.events).length;
              await appendLocalEventChunk(id, data.fightId, data.events, data.batchId);
              if (!closed) {
                worker?.postMessage({ type: 'ack', batchId: data.batchId });
              }
              break;
            case 'complete':
              emitProgress('persisting', 0);
              await updateLocalManifest(id, {
                status: 'persisting',
                diagnostics: data.diagnostics,
              });
              await updateLocalManifest(id, {
                status: 'ready',
                importDurationMs: performance.now() - importStartedAt,
                approximateStoredSize,
              });
              emitProgress('persisting', 1);
              if (close()) resolve(id);
              break;
            case 'error': {
              const details = data.diagnostics?.length
                ? ` ${data.diagnostics.map((diagnostic) => diagnostic.message).join(' ')}`
                : '';
              const error =
                data.name === 'AbortError'
                  ? abortError()
                  : new Error(`${data.message}${details}`.trim());
              if (close()) reject(error);
              break;
            }
          }
        } catch (error) {
          if (close()) reject(error);
        }
      };
      worker.onerror = (event) => {
        if (close()) {
          reject(new Error(event.message || 'Unable to run the local combat-log worker.'));
        }
      };
      worker.postMessage({ type: 'start', file, id });
    });
    return result;
  } catch (error) {
    close();
    if (staged) {
      await removeLocalReport(id).catch(() => undefined);
    }
    throw error;
  } finally {
    signal?.removeEventListener('abort', abort);
    close();
  }
}
