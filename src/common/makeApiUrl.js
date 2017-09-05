import makeUrl from './makeUrl';

const API_BASE = process.env.REACT_APP_API_BASE || '';

export default function makeApiUrl(endpoint, queryParams = {}) {
  return makeUrl(`${API_BASE}${endpoint}`, queryParams);
}
