import { openAsBlob } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';

import type { TargetDummyPreparationInput } from '../../localCombatLogProtocol';
import { routeLocalCombatLogDiscovery } from '../discoveryRouter';
import { prepareTargetDummyInput } from '../preparation';
import { normalizePreparedTargetDummyImport, prepareTargetDummyImport } from '../prepareImport';

const MEBIBYTE = 1024 * 1024;
const DEFAULT_MAX_DISCOVERY_MS = 30_000;
const DEFAULT_MAX_DISCOVERY_HEAP_MIB = 128;

interface Arguments {
  logPath: string;
  simcPath: string;
  maxDiscoveryMs: number;
  maxDiscoveryHeapMiB: number;
}

interface MemorySample {
  heapUsed: number;
  rss: number;
}

function usage(): never {
  throw new Error(
    'Usage: pnpm run target-dummy:measure -- --log <capture> --simc <profile> ' +
      '[--max-discovery-ms <milliseconds>] [--max-discovery-heap-mib <MiB>]',
  );
}

function positiveNumber(value: string | undefined, option: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${option} must be a positive number.`);
  }
  return parsed;
}

function parseArguments(values: readonly string[]): Arguments {
  const options = new Map<string, string>();
  for (let index = 0; index < values.length; index += 2) {
    const option = values[index];
    const value = values[index + 1];
    if (!option?.startsWith('--') || value === undefined) usage();
    options.set(option, value);
  }
  const logPath = options.get('--log');
  const simcPath = options.get('--simc');
  if (!logPath || !simcPath) usage();
  const supported = new Set(['--log', '--simc', '--max-discovery-ms', '--max-discovery-heap-mib']);
  const unknown = [...options.keys()].find((option) => !supported.has(option));
  if (unknown) throw new Error(`Unknown option: ${unknown}`);
  return {
    logPath: resolve(logPath),
    simcPath: resolve(simcPath),
    maxDiscoveryMs: positiveNumber(
      options.get('--max-discovery-ms') ?? String(DEFAULT_MAX_DISCOVERY_MS),
      '--max-discovery-ms',
    ),
    maxDiscoveryHeapMiB: positiveNumber(
      options.get('--max-discovery-heap-mib') ?? String(DEFAULT_MAX_DISCOVERY_HEAP_MIB),
      '--max-discovery-heap-mib',
    ),
  };
}

function fileFromBlob(blob: Blob, name: string): File {
  return {
    name,
    size: blob.size,
    type: blob.type,
    lastModified: 0,
    webkitRelativePath: '',
    arrayBuffer: () => blob.arrayBuffer(),
    bytes: () => blob.bytes(),
    slice: (...arguments_: Parameters<Blob['slice']>) => blob.slice(...arguments_),
    stream: () => blob.stream(),
    text: () => blob.text(),
  };
}

function memorySample(): MemorySample {
  const memory = process.memoryUsage();
  return { heapUsed: memory.heapUsed, rss: memory.rss };
}

function createMemorySampler(fileSize: number, baseline: MemorySample) {
  let peak = baseline;
  let nextSampleAt = 0;
  return {
    progress(value: number) {
      const bytesRead = value * fileSize;
      if (bytesRead < nextSampleAt && value < 1) return;
      nextSampleAt = bytesRead + MEBIBYTE;
      const sample = memorySample();
      peak = {
        heapUsed: Math.max(peak.heapUsed, sample.heapUsed),
        rss: Math.max(peak.rss, sample.rss),
      };
    },
    peakDeltaMiB() {
      return {
        heap: (peak.heapUsed - baseline.heapUsed) / MEBIBYTE,
        rss: (peak.rss - baseline.rss) / MEBIBYTE,
      };
    },
  };
}

function collectPreparation(
  route: Extract<
    Awaited<ReturnType<typeof routeLocalCombatLogDiscovery>>,
    { type: 'target-dummy-input-required' }
  >,
  simcProfile: string,
) {
  const sessions = [...route.discovery.sessions].sort(
    (left, right) =>
      Number(right.playerGuid === route.discovery.proposedRecorderGuid) -
        Number(left.playerGuid === route.discovery.proposedRecorderGuid) ||
      Number(right.confidence === 'likely') - Number(left.confidence === 'likely') ||
      right.durationMs - left.durationMs,
  );
  let lastFailure: string | undefined;
  for (const session of sessions) {
    const input: TargetDummyPreparationInput = {
      playerGuid: session.playerGuid,
      sessionId: session.id,
      simcProfile,
    };
    const result = prepareTargetDummyInput(route.discovery, route.localActors, route.build, input);
    if (result.ok) return result.value;
    lastFailure = `${result.error.code}: ${result.error.message}`;
  }
  throw new Error(lastFailure ?? 'No discovered attempt matched the supplied /simc profile.');
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const blob = await openAsBlob(options.logPath);
  const file = fileFromBlob(blob, basename(options.logPath));
  const simcProfile = await readFile(options.simcPath, 'utf8');

  globalThis.gc?.();
  const discoveryBaseline = memorySample();
  const discoveryMemory = createMemorySampler(file.size, discoveryBaseline);
  const discoveryStartedAt = performance.now();
  const route = await routeLocalCombatLogDiscovery(file, undefined, discoveryMemory.progress);
  const discoveryMs = performance.now() - discoveryStartedAt;
  const discoveryPeak = discoveryMemory.peakDeltaMiB();

  if (route.type !== 'target-dummy-input-required') {
    throw new Error(`Expected target-dummy discovery, received ${route.type}.`);
  }
  if (
    route.discovery.retainedState.retainedRawLineCount !== 0 ||
    route.discovery.retainedState.retainedNormalizedEventCount !== 0
  ) {
    throw new Error('Discovery retained source lines or normalized events.');
  }
  if (discoveryMs > options.maxDiscoveryMs) {
    throw new Error(
      `Discovery took ${round(discoveryMs)} ms; budget is ${options.maxDiscoveryMs} ms.`,
    );
  }
  if (discoveryPeak.heap > options.maxDiscoveryHeapMiB) {
    throw new Error(
      `Discovery peak heap delta was ${round(discoveryPeak.heap)} MiB; budget is ${options.maxDiscoveryHeapMiB} MiB.`,
    );
  }

  const prepared = collectPreparation(route, simcProfile);
  const plan = prepareTargetDummyImport(
    'target-dummy-performance',
    route.discovery,
    route.localActors,
    prepared,
  );
  globalThis.gc?.();
  const normalizationBaseline = memorySample();
  const normalizationMemory = createMemorySampler(file.size, normalizationBaseline);
  const normalizationStartedAt = performance.now();
  let approximateStoredBytes = 0;
  let eventCount = 0;
  let batchCount = 0;
  await normalizePreparedTargetDummyImport(
    file,
    plan,
    (_fightId, events) => {
      approximateStoredBytes += JSON.stringify(events).length;
      eventCount += events.length;
      batchCount += 1;
    },
    undefined,
    normalizationMemory.progress,
  );
  const normalizationMs = performance.now() - normalizationStartedAt;
  const normalizationPeak = normalizationMemory.peakDeltaMiB();

  const results = {
    capture: {
      path: options.logPath,
      bytes: file.size,
      mebibytes: round(file.size / MEBIBYTE),
    },
    discovery: {
      milliseconds: round(discoveryMs),
      recordsScanned: route.discovery.recordsScanned,
      players: route.discovery.players.length,
      sessions: route.discovery.sessions.length,
      retainedState: route.discovery.retainedState,
      peakHeapDeltaMiB: round(discoveryPeak.heap),
      peakRssDeltaMiB: round(discoveryPeak.rss),
      budgets: {
        milliseconds: options.maxDiscoveryMs,
        peakHeapDeltaMiB: options.maxDiscoveryHeapMiB,
      },
    },
    selectedWindow: {
      sessionId: prepared.session.id,
      durationMs: prepared.session.durationMs,
      analyzedDurationMs: prepared.session.end - prepared.session.fightStart,
      targetCount: prepared.session.targetGuids.length,
    },
    normalization: {
      milliseconds: round(normalizationMs),
      eventCount,
      batchCount,
      approximateStoredBytes,
      approximateStoredMiB: round(approximateStoredBytes / MEBIBYTE),
      storedToCaptureRatio: round(approximateStoredBytes / file.size),
      peakHeapDeltaMiB: round(normalizationPeak.heap),
      peakRssDeltaMiB: round(normalizationPeak.rss),
    },
  };
  process.stdout.write(`${JSON.stringify(results, undefined, 2)}\n`);
}

await main();
