import makeUrl from './makeUrl';

import WCL_API_KEY from './WCL_API_KEY';

export default function makeWclUrl(base, queryParams = {}) {
  queryParams.api_key = WCL_API_KEY;
  return makeUrl(base, queryParams);
}
