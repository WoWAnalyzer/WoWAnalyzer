import { QueryParams } from 'common/makeApiUrl';
import makeQueryString from 'common/makeQueryString';

export default function makeUrl(base: string, queryParams: QueryParams = {}) {
  const queryString = makeQueryString(queryParams);
  return queryString !== '' ? `${base}?${queryString}` : base;
}
