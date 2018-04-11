import { SET_REPORT_PROGRESS } from 'actions/reportProgress';

export default function report(state = null, action) {
  switch (action.type) {
    case SET_REPORT_PROGRESS:
      return action.payload;
    default:
      return state;
  }
}
