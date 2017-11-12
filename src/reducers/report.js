import { SET_REPORT } from 'actions/report';

export default function report(state = null, action) {
  switch (action.type) {
    case SET_REPORT:
      return action.payload;
    default:
      return state;
  }
}
