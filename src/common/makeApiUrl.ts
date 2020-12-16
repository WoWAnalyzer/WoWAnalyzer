import makeUrl from './makeUrl';
import REALMS from './REALMS';

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

export default function makeApiUrl(endpoint: string, queryParams: QueryParams = {}) {
  return makeUrl(
    `${process.env.REACT_APP_SERVER_BASE}${process.env.REACT_APP_API_BASE}${endpoint}`,
    queryParams,
  );
}
export function makeCharacterApiUrl(
  characterId?: string,
  region?: string,
  realm?: string,
  name?: string,
) {
  const parts = ['character'];
  if (characterId) {
    parts.push(characterId);
  }
  if (region && realm && name) {
    const realmSlug = REALMS[region as 'EU' | 'US' | 'KR' | 'TW']?.find(
      (item) => item.name === realm,
    )?.slug;
    parts.push(region);
    parts.push(realmSlug || realm);
    parts.push(name);
  }

  return makeApiUrl(parts.map((part) => encodeURIComponent(part)).join('/'));
}

export function makeGuildApiUrl(region?: string, realm?: string, name?: string) {
  const parts = ['guild'];
  if (region && realm && name) {
    parts.push(region);
    parts.push(realm);
    parts.push(name);
  }

  return makeApiUrl(parts.map((part) => encodeURIComponent(part)).join('/'));
}

export function makeItemApiUrl(itemId: string) {
  const parts = ['item', itemId];
  return makeApiUrl(parts.map((part) => encodeURIComponent(part)).join('/'));
}

export function makeSpellApiUrl(spellId: number) {
  const parts = ['spell', spellId];
  return makeApiUrl(parts.map((part) => encodeURIComponent(part)).join('/'));
}
