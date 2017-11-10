import ExtendableError from 'es6-error';

import makeWclUrl from './makeWclUrl';

export class ApiDownError extends ExtendableError {}
export class LogNotFoundError extends ExtendableError {}

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

export default async function fetchWcl(endpoint, queryParams) {
  const response = await fetch(makeWclUrl(endpoint, queryParams));

  if (response.status === 521) {
    throw new ApiDownError('The API is currently down. This is usually for maintenance which should only take about 10 seconds. Please try again in a moment.');
  }
  const json = await response.json();
  if (response.status === 400 || response.status === 401) {
    const message = tryParseMessage(json.message);
    if (message === 'This report does not exist or is private.') {
      throw new LogNotFoundError();
    }
    throw new Error(message || json.error);
  }
  return json;
}
