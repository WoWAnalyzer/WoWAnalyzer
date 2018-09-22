import ExtendableError from 'es6-error';

import { captureException } from 'common/errorLogger';

import makeWclApiUrl from './makeWclApiUrl';

export class ApiDownError extends ExtendableError {}
export class LogNotFoundError extends ExtendableError {}
export class CharacterNotFoundError extends ExtendableError {}
export class JsonParseError extends ExtendableError {
  originalError = null;
  raw = null;
  constructor(originalError, raw) {
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

async function rawFetchWcl(endpoint, queryParams) {
  const url = makeWclApiUrl(endpoint, queryParams);
  const response = await fetch(url);

  if (Object.values(HTTP_CODES.CLOUDFLARE).includes(response.status)) {
    throw new ApiDownError('The API is currently down. This is usually for maintenance which should only take about 10 seconds. Please try again in a moment.');
  }
  // Manually parse the response JSON so we keep the original data in memory so we can pass it to Sentry if something is wrong.
  let text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch (error) {
    // trys to replace non-ascii chars on "unexpected character"-errors
    // hotfixes the german logs that have control-characters in their names
    if (error instanceof SyntaxError) {
      try {
        text = text.replace(/[^\x20-\x7E]/g, '');
        json = JSON.parse(text);
      } catch (asciiFixError) {
        captureException(error, {
          extra: {
            text,
          },
        });
        throw new JsonParseError();
      }
    } else {
      captureException(error, {
        extra: {
          text,
        },
      });
      throw new JsonParseError();
    }
  }

  if ([HTTP_CODES.BAD_REQUEST, HTTP_CODES.UNAUTHORIZED].includes(response.status)) {
    const message = json.message;
    if (message === 'This report does not exist or is private.') {
      throw new LogNotFoundError();
    }
    if (message === 'Invalid character name/server/region specified.') {
      throw new CharacterNotFoundError();
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

const defaultOptions = {
  timeout: 10000,
};
export default function fetchWcl(endpoint, queryParams, options) {
  options = !options ? defaultOptions : { ...defaultOptions, ...options };

  return new Promise((resolve, reject) => {
    let timedOut = false;
    const timeoutTimer = setTimeout(() => {
      timedOut = true;
      reject(new Error('Request timed out. This usually happens because the Warcraft Logs API did not respond in a timely fashion. Try again.'));
    }, options.timeout);

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

function rawFetchFights(code, refresh = false, translate = true) {
  return fetchWcl(`report/fights/${code}`, {
    _: refresh ? +new Date() : undefined,
    translate: translate ? true : undefined, // so long as we don't have the entire site localized, it's better to have 1 consistent language
  });
}
export async function fetchFights(code, refresh = false) {
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
