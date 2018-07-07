import Cookies from 'universal-cookie';

import { SET_LANGUAGE } from 'Interface/actions/language';

const cookies = new Cookies();
const COOKIE_NAME = 'LANGUAGE';
const cookieOptions = {
  path: '/',
  maxAge: 86400 * 365, // 1 year
};
const defaultState = cookies.get(COOKIE_NAME) || 'en';

export default function language(state = defaultState, action) {
  switch (action.type) {
    case SET_LANGUAGE:
      cookies.set(COOKIE_NAME, action.payload, cookieOptions);
      return action.payload;
    default:
      return state;
  }
}
