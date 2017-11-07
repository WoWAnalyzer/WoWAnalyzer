import ExtendableError from 'es6-error';

import makeWclUrl from './makeWclUrl';

export class ApiDownError extends ExtendableError {}

export default function fetchWcl(endpoint, queryParams) {
  return fetch(makeWclUrl(endpoint, queryParams))
    .then(response => {
      // if (response.status === 521) {
        throw new ApiDownError('The API is currently down. This is usually for maintenance which should only take about 10 seconds. Please try again in a moment.');
      // }
      return response;
    })
    .then(response => response.json())
    .then(json => {
      if (json.status === 400 || json.status === 401) {
        throw json.error;
      }
      return json;
    });
}
