import makeUrl from './makeUrl';

let WCL_API_KEY = process.env.REACT_APP_WCL_API_KEY;

if (process.env.NODE_ENV === 'production') {
  // Ok this is pretty stupid. I'm just trying to make it harder to use my API key than to go into WCL and get your own. This achieves that even if it's ridiculous.
  // If I were to clone the repo I'd probably be lazy enough to just "temporarily" (there's nothing more important) copy the API key from the production file. With this silly cipher it's at least not **that** easy.

  let result = '';
  for (let i = 0; i < WCL_API_KEY.length; i++) {
    const charcode = WCL_API_KEY.charCodeAt(i) - 3;
    result += String.fromCharCode(charcode);
  }

  WCL_API_KEY = result;
}

export default function makeWclUrl(base, queryParams = {}) {
  if (!WCL_API_KEY) {
    const message = 'Invalid API key. You need to enter your own API key by creating a new file in the root repo called `.env.local` with the contents: `WCL_API_KEY=INSERT_YOUR_API_KEY_HERE`';
    alert(message);
    throw new Error(message);
  }
  queryParams.api_key = WCL_API_KEY;
  return makeUrl(base, queryParams);
}
