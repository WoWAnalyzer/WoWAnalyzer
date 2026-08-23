import { captureException } from 'common/errorLogger';
import { AnyEvent } from 'parser/core/Events';

import { QueryParams } from './makeApiUrl';
import { WclTable, WCLResponseJSON, WCLFightsResponse, WCLEventsResponse } from './WCL_TYPES';
import { WclReportClient } from 'report-data/wcl/WclReportClient';

export class ApiDownError extends Error {}
export class LogNotFoundError extends Error {}
export class CharacterNotFoundError extends Error {}
export class GuildNotFoundError extends Error {}
export class UnauthorizedError extends Error {}
export class JsonParseError extends Error {
  originalError?: Error;
  raw?: string;
  constructor(originalError?: Error, raw?: string) {
    super();
    this.originalError = originalError;
    this.raw = raw;
  }
}
export class WclApiError extends Error {}
export class UnknownApiError extends Error {}
export class CorruptResponseError extends Error {}
export class LegacyWclCapabilityUnavailableError extends Error {}

function fixControlCharacters(text: string) {
  // Try to replace non-ascii chars on "unexpected character"-errors
  // hotfixes the german logs that have control-characters in their names
  return text.replace(/[^\x20-\x7E]/g, '');
}
function fixSpellNameEscaping(text: string) {
  // WCL fails to escape spell names when using translate=true, leading to invalid JSON.
  // this fixes these logs by removing those
  const regex = /"name": ?"(.+?)",/g;

  while (true) {
    const match = regex.exec(text);
    if (match === null) {
      break;
    }
    const spellName = match[1];
    if (spellName.includes('"')) {
      text = text.replace(spellName, spellName.replace(/\\"/g, '"').replace(/"/g, '\\"'));
    }
  }
  return text;
}
export async function toJson(response: string | Response) {
  // Manually parse the response JSON so we keep the original data in memory so we can pass it to Sentry if something is wrong.
  let text = typeof response === 'string' ? response : await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    if (error instanceof SyntaxError) {
      try {
        text = fixControlCharacters(text);
        text = fixSpellNameEscaping(text);
        return JSON.parse(text);
      } catch {
        // Ignore the error since we're more interested in the original error.
      }
    }
    captureException(error as Error, {
      extra: {
        text,
      },
    });
    throw new JsonParseError();
  }
}

async function rawFetchWcl(
  endpoint: string,
  queryParams: QueryParams,
  noCache = false,
  signal?: AbortSignal,
) {
  if (import.meta.env.MODE === 'test') {
    throw new Error('Unable to query WCL during test');
  }
  const eventMatch = endpoint.match(/^report\/events(?:\/([^/]+))?\/([^/]+)$/);
  const tableMatch = endpoint.match(/^report\/tables\/([^/]+)\/([^/]+)$/);
  const graphMatch = endpoint.match(/^report\/graph\/([^/]+)\/([^/]+)$/);
  const fightsMatch = endpoint.match(/^report\/fights\/([^/]+)$/);
  const numberParam = (key: string) => {
    const value = queryParams[key];
    return typeof value === 'number' ? value : value === undefined ? undefined : Number(value);
  };
  const stringParam = (key: string) => {
    const value = queryParams[key];
    return value === undefined ? undefined : String(value);
  };
  const client = (code: string) =>
    /^(a:)?[a-zA-Z0-9]{16}$/.test(code)
      ? new WclReportClient({
          kind: 'warcraft-logs',
          code,
          isAnonymous: code.startsWith('a:'),
        })
      : (() => {
          throw new LegacyWclCapabilityUnavailableError(
            'This analysis requires a Warcraft Logs-only aggregate and is unavailable for local reports.',
          );
        })();

  if (eventMatch) {
    const events = await client(eventMatch[2]).loadEvents({
      start: numberParam('start'),
      end: numberParam('end'),
      actorId: numberParam('actorid'),
      abilityId: numberParam('abilityid'),
      filter: stringParam('filter'),
      dataType: eventMatch[1]
        ? eventMatch[1]
            .split('-')
            .map((part) => part[0].toUpperCase() + part.slice(1))
            .join('')
        : undefined,
      signal,
    });
    return { events };
  }
  if (tableMatch) {
    return client(tableMatch[2]).loadTable({
      start: numberParam('start') ?? 0,
      end: numberParam('end') ?? 0,
      sourceId: numberParam('actorid'),
      filter: stringParam('filter'),
      dataType: tableMatch[1],
      signal,
    });
  }
  if (graphMatch) {
    return client(graphMatch[2]).loadGraph({
      start: numberParam('start') ?? 0,
      end: numberParam('end') ?? 0,
      sourceId: numberParam('actorid'),
      filter: stringParam('filter'),
      dataType: graphMatch[1],
      signal,
    });
  }
  if (fightsMatch) return client(fightsMatch[1]).loadReport(signal);

  throw new WclApiError(
    `This browser-only build does not support the legacy Warcraft Logs operation: ${endpoint}`,
  );
}

interface FetchWclOptions {
  timeout?: number;
  signal?: AbortSignal;
}

const defaultOptions: Required<Pick<FetchWclOptions, 'timeout'>> = {
  timeout: 60000,
};
export default function fetchWcl<T extends WCLResponseJSON>(
  endpoint: string,
  queryParams: QueryParams,
  options?: FetchWclOptions,
  noCache = false,
): Promise<T> {
  options = !options ? defaultOptions : { ...defaultOptions, ...options };

  return new Promise<T>((resolve, reject) => {
    let timedOut = false;
    const timeoutTimer = setTimeout(() => {
      timedOut = true;
      reject(new Error('Request timed out, probably due to an issue on our side. Try again.'));
    }, options!.timeout);

    if (options.signal?.aborted) {
      clearTimeout(timeoutTimer);
      reject(new DOMException('The operation was aborted.', 'AbortError'));
      return;
    }

    rawFetchWcl(endpoint, queryParams, noCache, options.signal)
      .then((results) => {
        clearTimeout(timeoutTimer);
        if (timedOut) {
          return;
        }
        resolve(results as T);
      })
      .catch((err) => {
        clearTimeout(timeoutTimer);
        if (timedOut) {
          return;
        }
        reject(err);
      });
  });
}

function rawFetchFights(code: string, refresh = false, translate = true) {
  return fetchWcl<WCLFightsResponse>(
    `report/fights/${code}`,
    {
      translate: translate ? true : undefined, // so long as we don't have the entire site localized, it's better to have 1 consistent language
    },
    undefined,
    refresh,
  );
}
export async function fetchFights(code: string, refresh = false) {
  // This deals with a bunch of bugs in the fights API so implementers don't have to
  let json = await rawFetchFights(code, refresh);
  if (!json.fights) {
    // This is a relatively common WCL bug. Give it one more try with cache busting on, usually hits the spot.
    json = await rawFetchFights(code, true);
  }
  if (!json.fights) {
    // This is a new WCL bug where translate doesn't work even after a refresh, one more try without that then
    json = await rawFetchFights(code, true, false);
  }
  if (!json.fights) {
    throw new CorruptResponseError();
  }

  return json;
}
function rawFetchEventsPage(
  code: string,
  start: number,
  end: number,
  actorId?: number,
  filter?: string,
  signal?: AbortSignal,
) {
  return fetchWcl<WCLEventsResponse>(
    `report/events/${code}`,
    {
      start,
      end,
      actorid: actorId,
      filter,
      translate: true, // it's better to have 1 consistent language so long as we don't have the entire site localized
    },
    { signal, timeout: defaultOptions.timeout },
  );
}

export interface FetchEventsOptions {
  maxPages?: number;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

export async function fetchEvents(
  reportCode: string,
  fightStart: number,
  fightEnd: number,
  actorId?: number,
  filter?: string,
  options: FetchEventsOptions = {},
) {
  let pageStartTimestamp = fightStart;

  let events: AnyEvent[] = [];
  let page = 0;
  const duration = Math.max(1, fightEnd - fightStart);
  let lastProgress = 0;

  while (true) {
    options.signal?.throwIfAborted();
    const json = await rawFetchEventsPage(
      reportCode,
      pageStartTimestamp,
      fightEnd,
      actorId,
      filter,
      options.signal,
    );
    events = [...events, ...json.events!];
    page += 1;
    const nextTimestamp = json.nextPageTimestamp;
    lastProgress = Math.max(
      lastProgress,
      nextTimestamp === undefined
        ? 1
        : Math.max(0, Math.min(1, (nextTimestamp - fightStart) / duration)),
    );
    options.onProgress?.(lastProgress);
    if (nextTimestamp !== undefined) {
      if (nextTimestamp <= pageStartTimestamp) {
        throw new CorruptResponseError('WCL event pagination did not advance.');
      }
      if (nextTimestamp > fightEnd) {
        console.error('nextPageTimestamp is after fightEnd, do we need to manually filter too?');
      }
      pageStartTimestamp = nextTimestamp;
      if (options.maxPages !== undefined && page >= options.maxPages) {
        throw new Error('Interrupting due to exceeded max events pages. Something has gone wrong.');
      }
    } else {
      break;
    }
  }
  return events;
}
export function fetchCombatants(code: string, start: number, end: number) {
  return fetchEvents(code, start, end, undefined, 'type="combatantinfo"');
}

/**
 * Fetch a WCL table. These are not often useful for what we do because they
 * don't provide events, but sometimes the aggregations include behaviors that
 * we want to mimic (like Threat including active tanking time).
 */
export async function fetchTable<T extends WCLResponseJSON>(
  reportCode: string,
  fightStart: number,
  fightEnd: number,
  tableName: WclTable,
  sourceId?: number,
): Promise<T> {
  return fetchWcl(`report/tables/${tableName}/${reportCode}`, {
    start: fightStart,
    end: fightEnd,
    actorid: sourceId,
  });
}
