import { makeCharacterApiUrl } from 'common/makeApiUrl';
import { Character } from "common/contributor";

export const SUPPORTED_REGIONS = ['EU', 'US', 'TW', 'KR'];
export const STORE_CHARACTER = 'STORE_CHARACTER';
export function storeCharacter(character: Character) {
  return {
    type: STORE_CHARACTER,
    payload: character,
  };
}

export function fetchCharacter(guid: string, region: string, realm: string, name: string) {
  return async (dispatch: any) => {
    if (!SUPPORTED_REGIONS.includes(region)) {
      throw new Error('Region not supported');
    }
    const response = await fetch(makeCharacterApiUrl(guid, region, realm, name));
    if (response.status !== 200) {
      throw new Error(`Received unexpected response code: ${response.status}`);
    }
    const data = await response.json();

    dispatch(storeCharacter({
      guid,
      ...data,
    }));
    return data;
  };
}
