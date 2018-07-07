import { SET_LANGUAGE } from 'Interface/actions/language';

export default function language(state = 'en', action) {
  switch (action.type) {
    case SET_LANGUAGE:
      return action.payload;
    default:
      return state;
  }
}
