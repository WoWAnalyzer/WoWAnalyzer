import { SET_LANGUAGE } from 'interface/actions/language';
import { AnyAction } from 'redux';

const LOCAL_STORAGE_KEY = 'LANGUAGE';

const defaultState = localStorage.getItem(LOCAL_STORAGE_KEY) || 'en';

export type LanguageState = string;

export default function language(state: LanguageState = defaultState, action: AnyAction) {
  switch (action.type) {
    case SET_LANGUAGE:
      localStorage.setItem(LOCAL_STORAGE_KEY, action.payload);
      return action.payload;
    default:
      return state;
  }
}
