import ExtendableError from 'es6-error';

import makeWclUrl from './makeWclUrl';

export class ApiDownError extends ExtendableError {}
export class LogNotFoundError extends ExtendableError {}
export class UnknownApiError extends ExtendableError {}
export class CorruptResponseError extends ExtendableError {}

function tryParseMessage(message) {
  try {
    const errorMessage = JSON.parse(message);
    if (errorMessage.error) {
      return errorMessage.error;
    }
  } catch (error) {
    // We don't care about an error parsing the error, message's default value is fine
  }
  return null;
}

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

export default async function fetchWcl(endpoint, queryParams) {
  const url = makeWclUrl(endpoint, queryParams);
  const response = await fetch(url);

  if (Object.values(HTTP_CODES.CLOUDFLARE).includes(response.status)) {
    throw new ApiDownError('The API is currently down. This is usually for maintenance which should only take about 10 seconds. Please try again in a moment.');
  }
  const json = await response.json();
  if ([HTTP_CODES.BAD_REQUEST, HTTP_CODES.UNAUTHORIZED].includes(response.status)) {
    const message = tryParseMessage(json.message);
    if (message === 'This report does not exist or is private.') {
      throw new LogNotFoundError();
    }
    throw new Error(message || json.error);
  }
  if (response.status !== HTTP_CODES.OK) {
    throw new UnknownApiError(`Received HTTP code ${response.status}`);
  }
  return json;
}
