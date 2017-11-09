import { SET_REPORT_CODE } from 'actions/reportCode';

export default function report(state = null, action) {
  switch (action.type) {
    case SET_REPORT_CODE:
      return action.payload;
    default:
      return state;
  }
}
