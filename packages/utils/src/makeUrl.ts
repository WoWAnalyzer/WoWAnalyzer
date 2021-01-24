import makeQueryString from 'common/makeQueryString';
import { QueryParams } from 'common/makeApiUrl';

export default function makeUrl(base: string, queryParams: QueryParams = {}) {
  const queryString = makeQueryString(queryParams);
  return queryString !== '' ? `${base}?${queryString}` : base;
}
