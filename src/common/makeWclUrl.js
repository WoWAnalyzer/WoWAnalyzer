import makeUrl from './makeUrl';

const API_BASE = process.env.REACT_APP_API_BASE || '';
const WCL_API_KEY = process.env.REACT_APP_WCL_API_KEY;

export default function makeWclUrl(base, queryParams = {}) {
  if (!WCL_API_KEY && process.env.NODE_ENV !== 'production') {
    const message = 'Invalid API key. You need to enter your own API key by creating a new file in the root repo called `.env.local` with the contents: `WCL_API_KEY=INSERT_YOUR_API_KEY_HERE`';
    alert(message);
    throw new Error(message);
  }
  queryParams.api_key = WCL_API_KEY;
  return makeUrl(`${API_BASE}${base}`, queryParams);
}
