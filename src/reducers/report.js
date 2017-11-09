import { SET_REPORT } from 'actions/report';
import { SET_REPORT_CODE } from 'actions/reportCode';

export default function report(state = null, action) {
  switch (action.type) {
    case SET_REPORT:
      return action.payload;
    case SET_REPORT_CODE:
      return !state || state.code !== action.payload ? null : state;
    default:
      return state;
  }
}
