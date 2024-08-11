import { QueryParams } from 'common/makeApiUrl';
import makeApiUrl from 'common/makeApiUrl';

export default function makeWclApiUrl(endpoint: string, queryParams: QueryParams = {}) {
  return makeApiUrl(`v1/${endpoint}`, queryParams);
}
