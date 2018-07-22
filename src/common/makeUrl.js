import makeQueryString from './makeQueryString';

export default function makeUrl(base, queryParams = {}) {
  return `${base}?${makeQueryString(queryParams)}`;
}
