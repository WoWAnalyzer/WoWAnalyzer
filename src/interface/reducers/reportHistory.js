import { APPEND_REPORT_HISTORY } from 'interface/actions/reportHistory';

const LOCAL_STORAGE_KEY = 'REPORT_HISTORY';
const MAX_ITEMS = 5;

const defaultState = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];

export default function reportHistory(state = defaultState, action) {
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
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newState));
      return newState;
    }
    default:
      return state;
  }
}
