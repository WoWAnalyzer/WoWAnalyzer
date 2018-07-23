import makeUrl from './makeUrl';

export default function makeApiUrl(endpoint, queryParams = {}) {
  return makeUrl(`${process.env.REACT_APP_SERVER_BASE}${process.env.REACT_APP_API_BASE}${endpoint}`, queryParams);
}
export function makeCharacterApiUrl(characterId = null, region = null, realm = null, name = null, fields = undefined) {
  return makeApiUrl(`character/${characterId ? `${characterId}/` : ''}${region}/${encodeURIComponent(realm)}/${encodeURIComponent(name)}`, {
    fields,
  });
}
