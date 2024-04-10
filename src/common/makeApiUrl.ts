import { REALMS } from 'game/REALMS';

import makeUrl from './makeUrl';
import { isSupportedRegion } from 'common/regions';

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

export default function makeApiUrl(endpoint: string, queryParams: QueryParams = {}) {
  return makeUrl(
    `${import.meta.env.VITE_SERVER_BASE}${import.meta.env.VITE_API_BASE}${endpoint}`,
    queryParams,
  );
}
export function makeCharacterApiUrl(
  characterId?: number,
  region?: string,
  realm?: string,
  name?: string,
  classic?: boolean,
) {
  const parts = ['character'];
  if (classic) {
    parts.push('classic');
  }
  if (characterId) {
    parts.push(characterId.toString());
  }
  if (isSupportedRegion(region) && realm && name) {
    const realmSlug = REALMS[region as 'EU' | 'US' | 'KR' | 'TW']?.find(
      (item) => item.name === realm,
    )?.slug;
    parts.push(region);
    parts.push(realmSlug || realm);
    parts.push(name);
  }

  return makeApiUrl(parts.map((part) => encodeURIComponent(part)).join('/'));
}

export function makeGuildApiUrl(region?: string, realm?: string, name?: string, classic?: boolean) {
  const parts = ['guild'];
  if (classic) {
    parts.push('classic');
  }
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
