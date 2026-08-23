import { normalizeCombatLog, type LocalActor } from './LocalCombatLogParser';
import type {
  LocalCombatLogWorkerInput,
  LocalCombatLogWorkerOutput,
  PreparedTargetDummyInput,
  TargetDummyInputRequest,
} from './localCombatLogProtocol';
import type { TargetDummyDiscoveryRoute } from './target-dummy/contracts';
import { routeLocalCombatLogDiscovery } from './target-dummy/discoveryRouter';
import { prepareTargetDummyInput } from './target-dummy/preparation';
import {
  normalizePreparedTargetDummyImport,
  prepareTargetDummyImport,
} from './target-dummy/prepareImport';

interface PausedTargetDummyOperation {
  readonly operationId: string;
  readonly file: File;
  readonly route: Extract<TargetDummyDiscoveryRoute, { type: 'target-dummy-input-required' }>;
  readonly requestId: number;
  readonly prepared?: PreparedTargetDummyInput;
}

const acknowledgements = new Map<number, () => void>();
let pausedTargetDummy: PausedTargetDummyOperation | undefined;
let activeOperationId: string | undefined;

const post = (message: LocalCombatLogWorkerOutput) => self.postMessage(message);

function targetDummyRequest(route: PausedTargetDummyOperation['route']): TargetDummyInputRequest {
  return { discovery: route.discovery, diagnostics: route.diagnostics };
}

async function runEncounterImport(
  file: File,
  operationId: string,
  route: Extract<TargetDummyDiscoveryRoute, { type: 'encounter' }>,
) {
  const discovery = route.discovery;
  await new Promise<void>((resolve) => {
    acknowledgements.set(-1, resolve);
    post({
      type: 'discovered',
      operationId,
      importKind: 'encounter-log',
      report: discovery.report(operationId),
      actors: [...discovery.actors.values()] as LocalActor[],
      diagnostics: discovery.diagnostics,
    });
  });
  if (activeOperationId !== operationId) return;
  post({ type: 'progress', operationId, phase: 'normalizing', progress: 0 });
  let batchId = 0;
  await normalizeCombatLog(
    file,
    discovery,
    (fightId, events) =>
      new Promise<void>((resolve) => {
        const currentBatchId = batchId++;
        acknowledgements.set(currentBatchId, resolve);
        post({ type: 'batch', operationId, batchId: currentBatchId, fightId, events });
      }),
    undefined,
    (progress) => post({ type: 'progress', operationId, phase: 'normalizing', progress }),
  );
  post({ type: 'complete', operationId, diagnostics: discovery.diagnostics });
}

async function start(file: File, operationId: string) {
  activeOperationId = operationId;
  pausedTargetDummy = undefined;
  acknowledgements.clear();
  post({ type: 'progress', operationId, phase: 'discovering', progress: 0 });
  const route = await routeLocalCombatLogDiscovery(file, undefined, (progress) =>
    post({ type: 'progress', operationId, phase: 'discovering', progress }),
  );
  if (activeOperationId !== operationId) return;
  if (route.type === 'unsupported-input') {
    post({
      type: 'error',
      operationId,
      message: route.error.message,
      diagnostics: [...route.error.diagnostics],
    });
    return;
  }
  if (route.type === 'target-dummy-input-required') {
    const requestId = 1;
    pausedTargetDummy = { operationId, file, route, requestId };
    post({
      type: 'target-dummy-input-required',
      operationId,
      requestId,
      request: targetDummyRequest(route),
    });
    return;
  }
  await runEncounterImport(file, operationId, route);
}

async function prepareTargetDummy(
  message: Extract<LocalCombatLogWorkerInput, { type: 'prepare-target-dummy' }>,
) {
  const paused = pausedTargetDummy;
  if (
    !paused ||
    paused.operationId !== message.operationId ||
    paused.requestId !== message.requestId ||
    activeOperationId !== message.operationId ||
    paused.prepared
  ) {
    return;
  }
  const prepared = prepareTargetDummyInput(
    paused.route.discovery,
    paused.route.localActors,
    paused.route.build,
    message.input,
  );
  if (!prepared.ok) {
    post({
      type: 'target-dummy-input-error',
      operationId: message.operationId,
      requestId: message.requestId,
      request: {
        ...targetDummyRequest(paused.route),
        validationError: prepared.error,
      },
    });
    return;
  }
  const preparedMessage = {
    type: 'target-dummy-prepared',
    operationId: message.operationId,
    requestId: message.requestId,
    prepared: prepared.value,
  } as const;
  pausedTargetDummy = { ...paused, prepared: prepared.value };
  post(preparedMessage);
  const plan = prepareTargetDummyImport(
    message.operationId,
    paused.route.discovery,
    paused.route.localActors,
    prepared.value,
  );
  await new Promise<void>((resolve) => {
    acknowledgements.set(-1, resolve);
    post({
      type: 'discovered',
      operationId: message.operationId,
      importKind: 'target-dummy',
      report: plan.report,
      actors: plan.actors,
      diagnostics: [...paused.route.diagnostics, ...plan.diagnostics],
    });
  });
  if (activeOperationId !== message.operationId) return;
  post({ type: 'progress', operationId: message.operationId, phase: 'normalizing', progress: 0 });
  let batchId = 0;
  await normalizePreparedTargetDummyImport(
    paused.file,
    plan,
    (fightId, events) =>
      new Promise<void>((resolve) => {
        const currentBatchId = batchId++;
        acknowledgements.set(currentBatchId, resolve);
        post({
          type: 'batch',
          operationId: message.operationId,
          batchId: currentBatchId,
          fightId,
          events,
        });
      }),
    undefined,
    (progress) =>
      post({ type: 'progress', operationId: message.operationId, phase: 'normalizing', progress }),
  );
  post({
    type: 'complete',
    operationId: message.operationId,
    diagnostics: [...paused.route.diagnostics, ...plan.diagnostics],
  });
}

self.onmessage = async ({ data }: MessageEvent<LocalCombatLogWorkerInput>) => {
  if (data.type === 'ack') {
    if (data.operationId !== activeOperationId) return;
    acknowledgements.get(data.batchId)?.();
    acknowledgements.delete(data.batchId);
    return;
  }
  try {
    if (data.type === 'prepare-target-dummy') {
      await prepareTargetDummy(data);
    } else {
      await start(data.file, data.operationId);
    }
  } catch (error) {
    post({
      type: 'error',
      operationId: data.operationId,
      name: error instanceof DOMException ? error.name : undefined,
      message: error instanceof Error ? error.message : 'Unable to parse combat log',
      diagnostics:
        error instanceof Error && 'diagnostics' in error
          ? ((error as { diagnostics: unknown }).diagnostics as never)
          : [],
    });
  }
};
