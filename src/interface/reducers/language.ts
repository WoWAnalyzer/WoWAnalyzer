import { SET_LANGUAGE } from 'interface/actions/language';
import { AnyAction } from 'redux';
import Cookies from 'universal-cookie';

const cookies = new Cookies();
const COOKIE_NAME = 'LANGUAGE';
const cookieOptions = {
  path: '/',
  maxAge: 86400 * 365, // 1 year
};
const defaultState = cookies.get(COOKIE_NAME) || 'en';

export type LanguageState = string;

export default function language(state: LanguageState = defaultState, action: AnyAction) {
  switch (action.type) {
    case SET_LANGUAGE:
      cookies.set(COOKIE_NAME, action.payload, cookieOptions);
      return action.payload;
    default:
      return state;
  }
}
