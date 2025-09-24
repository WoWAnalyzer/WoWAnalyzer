import SPECS, { Spec } from 'game/SPECS';
import makeApiUrl from './makeApiUrl';
import GameBranch from 'game/GameBranch';

export interface ServerMetrics<T = number> {
  /**
   * The number of cooldown errors per minute.
   */
  cooldownErrorRate: T;
  /**
   * The number of unknown abilities used per minute.
   */
  unknownAbilityErrorRate: T;
  /**
   * The number of gcd errors per minute.
   */
  gcdErrorRate: T;
  /**
   * The fractional active time ratio (from 0.00 to 1.00)
   */
  activeTimeRatio: T;
}

export interface Aggregate {
  min: number;
  max: number;
  avg: number;
}

export interface Selection {
  reportCode: string;
  fightId: number;
  playerId: number;
  configName: string;
}

// note: not naming it 'server-metrics' to avoid zealous adblock extensions blocking it as an ad tracking call (which it is not)
const ENDPOINT = 'v1/server-data';

export async function uploadServerMetrics(
  selection: Selection,
  serverMetrics: ServerMetrics,
): Promise<void> {
  try {
    const response = await fetch(makeApiUrl(ENDPOINT), {
      body: JSON.stringify({
        selection,
        serverMetrics,
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.info('failed to upload spec server data', response, await response.text());
    }
  } catch (err) {
    // never trigger errors from this.
    console.info('failed to upload spec server data', err);
  }
}

export async function loadServerMetrics(): Promise<
  Array<[Spec, Partial<ServerMetrics<Aggregate>>]>
> {
  const response = await fetch(makeApiUrl(ENDPOINT));
  const data: RawServerMetricValue[] = await response.json();

  const grouped = groupRawMetrics(data);

  return Object.entries(grouped)
    .map(([configName, metrics]) => [findSpecByConfigName(configName), metrics])
    .filter(([spec]) => spec !== undefined) as [Spec, Partial<ServerMetrics<Aggregate>>][];
}

function parseConfigName(configName: string): {
  branch: GameBranch;
  className: string;
  specName: string;
} {
  const [branchName, className, specName] = configName.split('-');

  if (branchName === 'classic') {
    return { className, specName, branch: GameBranch.Classic };
  } else if (branchName === 'retail') {
    return { className, specName, branch: GameBranch.Retail };
  }

  throw new Error('unable to parse configName ' + configName);
}

interface RawServerMetricValue {
  configName: string;
  metricId: keyof ServerMetrics;
  avgValue: number;
  maxValue: number;
  minValue: number;
}

/**
 * Group metrics by configName value.
 */
function groupRawMetrics(
  raw: RawServerMetricValue[],
): Record<string, Partial<ServerMetrics<Aggregate>>> {
  const grouped: ReturnType<typeof groupRawMetrics> = {};
  for (const metric of raw) {
    if (!grouped[metric.configName]) {
      grouped[metric.configName] = {};
    }

    grouped[metric.configName][metric.metricId] = {
      min: metric.minValue,
      max: metric.maxValue,
      avg: metric.avgValue,
    };
  }

  return grouped;
}

function findSpecByConfigName(configName: string): Spec | undefined {
  const props = parseConfigName(configName);

  for (const spec of Object.values(SPECS)) {
    if (
      spec.branch === props.branch &&
      spec.wclClassName === props.className &&
      spec.wclSpecName === props.specName
    ) {
      return spec;
    }
  }

  return undefined;
}
