import makeQueryString from './makeQueryString';

export default function makeUrl(base, queryParams = {}) {
  const queryString = makeQueryString(queryParams);
  return queryString !== '' ? `${base}?${queryString}` : base;
}
