import makeWclUrl from './makeWclUrl';

export default function fetchWcl(endpoint, queryParams) {
  return fetch(makeWclUrl(endpoint, queryParams))
    .then(response => response.json())
    .then(json => {
      if (json.status === 400 || json.status === 401) {
        throw json.error;
      }
      return json;
    });
}
