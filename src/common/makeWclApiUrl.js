import makeApiUrl from './makeApiUrl';

const WCL_API_KEY = process.env.REACT_APP_WCL_API_KEY;

// Since the WCL API has a fairly strict request cap, we have implemented a proxy that caches responses.  This proxy provides the same functionality as WCL.
export default function makeWclApiUrl(endpoint, queryParams = {}) {
  if (!WCL_API_KEY && process.env.NODE_ENV !== 'production') {
    const message = 'Invalid API key. You need to enter your own API key by creating a new file in the root repo called `.env.local` with the contents: `WCL_API_KEY=INSERT_YOUR_API_KEY_HERE`. After saving this file, you need to restart `npm start`.';
    // eslint-disable-next-line no-alert
    alert(message);
    throw new Error(message);
  }
  queryParams.api_key = WCL_API_KEY;
  return makeApiUrl(`v1/${endpoint}`, queryParams);
}
