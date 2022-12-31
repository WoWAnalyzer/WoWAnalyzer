import { STORE_CHARACTER } from 'interface/actions/characters';
import CharacterProfile from 'parser/core/CharacterProfile';
import { AnyAction } from 'redux';

export interface CharactersByIdState {
  [guid: number]: CharacterProfile;
}

export default function charactersById(state: CharactersByIdState = {}, action: AnyAction) {
  switch (action.type) {
    case STORE_CHARACTER:
      return {
        ...state,
        [action.payload.guid]: action.payload,
      };
    default:
      return state;
  }
}
