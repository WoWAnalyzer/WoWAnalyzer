import ExtendableError from 'es6-error';

import { captureException } from 'common/errorLogger';
import { AnyEvent } from 'parser/core/Events';

import makeWclApiUrl from './makeWclApiUrl';
import { QueryParams } from './makeApiUrl';
import { WclOptions, WCLResponseJSON, WCLFightsResponse, WCLEventsResponse } from './WCL_TYPES';

export class ApiDownError extends ExtendableError {}
export class LogNotFoundError extends ExtendableError {}
export class CharacterNotFoundError extends ExtendableError {}
export class GuildNotFoundError extends ExtendableError {}
export class JsonParseError extends ExtendableError {
  originalError?: ExtendableError;
  raw?: string;
  constructor(originalError?: ExtendableError, raw?: string) {
    super();
    this.originalError = originalError;
    this.raw = raw;
  }
}
export class WclApiError extends ExtendableError {}
export class UnknownApiError extends ExtendableError {}
export class CorruptResponseError extends ExtendableError {}

const HTTP_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  CLOUDFLARE: {
    UNKNOWN_ERROR: 520,
    WEB_SERVER_IS_DOWN: 521,
    CONNECTION_TIMED_OUT: 522,
    ORIGIN_IS_UNREACHABLE: 523,
    A_TIMEOUT_OCCURED: 524,
  },
};
const WCL_API_ERROR_TEXT = 'Warcraft Logs API error';

function fixControlCharacters(text: string) {
  // Try to replace non-ascii chars on "unexpected character"-errors
  // hotfixes the german logs that have control-characters in their names
  return text.replace(/[^\x20-\x7E]/g, '');
}
function fixSpellNameEscaping(text: string) {
  // WCL fails to escape spell names when using translate=true, leading to invalid JSON.
  // this fixes these logs by removing those
  const regex = /"name": ?"(.+?)",/g;
  // eslint-disable-next-line
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
      } catch (asciiFixError) {
        // Ignore the error since we're more interested in the original error.
      }
    }
    captureException(error, {
      extra: {
        text,
      },
    });
    throw new JsonParseError();
  }
}

async function rawFetchWcl(endpoint: string, queryParams: QueryParams) {
  if (process.env.NODE_ENV === 'test') {
    throw new Error('Unable to query WCL during test');
  }
  const url = makeWclApiUrl(endpoint, queryParams);
  const response = await fetch(url);

  if (Object.values(HTTP_CODES.CLOUDFLARE).includes(response.status)) {
    throw new ApiDownError('The API is currently down. This is usually for maintenance which should only take about 10 seconds. Please try again in a moment.');
  }
  const json = await toJson(response);

  if ([HTTP_CODES.BAD_REQUEST, HTTP_CODES.UNAUTHORIZED].includes(response.status)) {
    const message = json.message;
    if (message === 'This report does not exist or is private.') {
      throw new LogNotFoundError();
    }
    if (message === 'Invalid character name/server/region specified.') {
      throw new CharacterNotFoundError();
    }
    if (message === 'Invalid guild name/server/region specified.') {
      throw new GuildNotFoundError();
    }
    throw new Error(message || json.error);
  }
  if (!response.ok) {
    if (json.error === WCL_API_ERROR_TEXT) {
      throw new WclApiError(`${response.status}: ${json.message}`);
    } else {
      throw new UnknownApiError(`${response.status}: ${json.message}`);
    }
  }
  return json;
}

const defaultOptions: WclOptions = {
  timeout: 10000,
};
export default function fetchWcl<T extends WCLResponseJSON>(endpoint: string, queryParams: QueryParams, options?: WclOptions): Promise<T> {
  options = !options ? defaultOptions : { ...defaultOptions, ...options };

  return new Promise<T>((resolve, reject) => {
    let timedOut = false;
    const timeoutTimer = setTimeout(() => {
      timedOut = true;
      reject(new Error('Request timed out, probably due to an issue on our side. Try again.'));
    }, options!.timeout);

    rawFetchWcl(endpoint, queryParams)
      .then(results => {
        clearTimeout(timeoutTimer);
        if (timedOut) {
          return;
        }
        resolve(results);
      })
      .catch(err => {
        clearTimeout(timeoutTimer);
        if (timedOut) {
          return;
        }
        reject(err);
      });
  });
}

function rawFetchFights(code: string, refresh = false, translate = true) {
  return fetchWcl<WCLFightsResponse>(`report/fights/${code}`, {
    _: refresh ? Number(new Date()) : undefined,
    translate: translate ? true : undefined, // so long as we don't have the entire site localized, it's better to have 1 consistent language
  });
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
function rawFetchEventsPage(code: string, start: number, end: number, actorId?: number, filter?: string) {
  return fetchWcl<WCLEventsResponse>(`report/events/${code}`, {
    start,
    end,
    actorid: actorId,
    filter,
    translate: true, // it's better to have 1 consistent language so long as we don't have the entire site localized
  });
}
export async function fetchEvents(reportCode: string, fightStart: number, fightEnd: number, actorId?: number, filter?: string, maxPages = 3) {
  let pageStartTimestamp = fightStart;

  let events: AnyEvent[] = [];
  let page = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const json = await rawFetchEventsPage(reportCode, pageStartTimestamp, fightEnd, actorId, filter);
    events = [
      ...events,
      ...json.events!,
    ];
    if (json.nextPageTimestamp) {
      if (json.nextPageTimestamp > fightEnd) {
        console.error('nextPageTimestamp is after fightEnd, do we need to manually filter too?');
      }
      pageStartTimestamp = json.nextPageTimestamp;
      page += 1;
      if (page >= maxPages) {
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
