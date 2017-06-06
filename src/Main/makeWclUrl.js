import makeUrl from './makeUrl';

const WCL_API_KEY = process.env.REACT_APP_WCL_API_KEY;

export default function makeWclUrl(base, queryParams = {}) {
  if (process.env.NODE_ENV === 'development' && (!WCL_API_KEY || WCL_API_KEY === '97c84db1a100b32a6d5abb763711244e')) {
    console.log(WCL_API_KEY, process.env);
    const message = 'Invalid API key. You need to enter your own API key by creating a new file in the root repo called `.env.local` with the contents: `WCL_API_KEY=INSERT_YOUR_API_KEY_HERE`';
    alert(message);
    throw new Error(message);
  }
  queryParams.api_key = WCL_API_KEY;
  return makeUrl(base, queryParams);
}
