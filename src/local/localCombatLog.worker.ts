import { discoverCombatLog, normalizeCombatLog, type LocalActor } from './LocalCombatLogParser';

type StartMessage = { type: 'start'; file: File; id: string };
type AckMessage = { type: 'ack'; batchId: number };

const acknowledgements = new Map<number, () => void>();

self.onmessage = async ({ data }: MessageEvent<StartMessage | AckMessage>) => {
  if (data.type === 'ack') {
    acknowledgements.get(data.batchId)?.();
    acknowledgements.delete(data.batchId);
    return;
  }

  const { file, id } = data;
  try {
    self.postMessage({ type: 'progress', phase: 'discovering', progress: 0 });
    const discovery = await discoverCombatLog(file, id, undefined, (progress) =>
      self.postMessage({ type: 'progress', phase: 'discovering', progress }),
    );
    await new Promise<void>((resolve) => {
      acknowledgements.set(-1, resolve);
      self.postMessage({
        type: 'discovered',
        report: discovery.report(id),
        actors: [...discovery.actors.values()] as LocalActor[],
        diagnostics: discovery.diagnostics,
      });
    });
    self.postMessage({ type: 'progress', phase: 'normalizing', progress: 0 });
    let batchId = 0;
    await normalizeCombatLog(
      file,
      discovery,
      (fightId, events) =>
        new Promise<void>((resolve) => {
          const currentBatchId = batchId++;
          acknowledgements.set(currentBatchId, resolve);
          self.postMessage({ type: 'batch', batchId: currentBatchId, fightId, events });
        }),
      undefined,
      (progress) => self.postMessage({ type: 'progress', phase: 'normalizing', progress }),
    );
    self.postMessage({ type: 'complete', diagnostics: discovery.diagnostics });
  } catch (error) {
    self.postMessage({
      type: 'error',
      name: error instanceof DOMException ? error.name : undefined,
      message: error instanceof Error ? error.message : 'Unable to parse combat log',
      diagnostics:
        error instanceof Error && 'diagnostics' in error
          ? (error as { diagnostics: unknown }).diagnostics
          : [],
    });
  }
};
