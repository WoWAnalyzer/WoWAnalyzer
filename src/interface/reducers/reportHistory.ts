import { APPEND_REPORT_HISTORY, ReportHistory } from 'interface/actions/reportHistory';
import Cookies from 'universal-cookie';
import { AnyAction } from 'redux';

const MAX_ITEMS = 5;
const cookies = new Cookies();
const COOKIE_NAME = 'REPORT_HISTORY';
const cookieOptions = {
  path: '/',
  maxAge: 86400 * 365, // 1 year
};
const defaultState = cookies.get<ReportHistory[]>(COOKIE_NAME) || [];

export default function reportHistory(state: ReportHistory[] = defaultState, action: AnyAction) {
  switch (action.type) {
    case APPEND_REPORT_HISTORY: {
      let newState = [
        ...state.filter((item) => item.code !== action.payload.code), // remove existing report with this code
        action.payload,
      ];
      const numItems = newState.length;
      if (numItems > MAX_ITEMS) {
        newState = newState.slice(numItems - MAX_ITEMS);
      }
      cookies.set(COOKIE_NAME, newState, cookieOptions);
      return newState;
    }
    default:
      return state;
  }
}
