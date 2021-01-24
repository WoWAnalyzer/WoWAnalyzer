import { QueryParams } from 'common/makeApiUrl';
import makeApiUrl from 'common/makeApiUrl';

const WCL_API_KEY = process.env.REACT_APP_WCL_API_KEY || undefined;
if (!WCL_API_KEY && process.env.NODE_ENV === 'development') {
  throw new Error('Invalid API key. You need to enter your own API key by creating a new file in the root repo called `.env.local` with the contents: `WCL_API_KEY=INSERT_YOUR_API_KEY_HERE`. After saving this file, you need to restart `yarn start`.');
}

// Since the WCL API has a fairly strict request cap, we have implemented a proxy that caches responses.  This proxy provides the same functionality as WCL.
export default function makeWclApiUrl(endpoint: string, queryParams: QueryParams = {}) {
  // eslint-disable-next-line @typescript-eslint/camelcase
  queryParams.api_key = WCL_API_KEY;
  return makeApiUrl(`v1/${endpoint}`, queryParams);
}
