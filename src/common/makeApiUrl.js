import makeUrl from './makeUrl';

export default function makeApiUrl(endpoint, queryParams = {}) {
  return makeUrl(`${process.env.REACT_APP_SERVER_BASE}${process.env.REACT_APP_API_BASE}${endpoint}`, queryParams);
}
export function makeCharacterApiUrl(characterId = null, region = null, realm = null, name = null) {
  const parts = ['character'];
  if (characterId) {
    parts.push(characterId);
  }
  if (region && realm && name) {
    parts.push(region);
    parts.push(realm);
    parts.push(name);
  }

  return makeApiUrl(parts.map(part => encodeURIComponent(part)).join('/'));
}

export function makeItemApiUrl(itemId, region = 'us') {
   if (!Number.isInteger(itemId)){
    return false;
  }
  const parts = ['item', region, itemId];
  return makeApiUrl(parts.map(part => encodeURIComponent(part)).join('/'));
}

export function makeSpellApiUrl(spellId, region = 'us') {
   if (!Number.isInteger(spellId)){
    return false;
  }
  const parts = ['spell', region, spellId];
  return makeApiUrl(parts.map(part => encodeURIComponent(part)).join('/'));
}
