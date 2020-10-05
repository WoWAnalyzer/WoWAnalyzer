import makeQueryString from './makeQueryString';
import { QueryParams } from './QueryParams';

export default function makeUrl(base: string, queryParams: QueryParams = {}): string {
  const queryString = makeQueryString(queryParams);
  return queryString !== '' ? `${base}?${queryString}` : base;
}
