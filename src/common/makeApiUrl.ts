import makeUrl from './makeUrl';
import { QueryParams } from './QueryParams';

export default function makeApiUrl(endpoint: string, queryParams: QueryParams = {}) {
  return makeUrl(`${process.env.REACT_APP_SERVER_BASE}${process.env.REACT_APP_API_BASE}${endpoint}`, queryParams);
}

type Fragment = string | null

export function makeCharacterApiUrl(
  characterId: Fragment = null,
  region: Fragment = null,
  realm: Fragment = null,
  name: Fragment = null,
) {
  const parts = ['character'];
  if (characterId) {
    parts.push(characterId);
  }
  if (region && realm && name) {
    parts.push(region, realm, name);
  }

  return makeApiUrl(parts.map(part => encodeURIComponent(part)).join('/'));
}

export function makeGuildApiUrl(region: Fragment = null, realm: Fragment = null, name: Fragment = null) {
  const parts = ['guild'];
  if (region && realm && name) {
    parts.push(region, realm, name);
  }
  return makeApiUrl(parts.map(part => encodeURIComponent(part)).join('/'));
}

export function makeItemApiUrl(itemId: string | number) {
  const parts = ['item', itemId];
  return makeApiUrl(parts.map(part => encodeURIComponent(part)).join('/'));
}

export function makeSpellApiUrl(spellId: string | number) {
  const parts = ['spell', spellId];
  return makeApiUrl(parts.map(part => encodeURIComponent(part)).join('/'));
}
