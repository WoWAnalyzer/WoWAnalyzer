import { STORE_CHARACTER } from 'interface/actions/characters';

export default function charactersById(state = {}, action) {
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
