import { SET_ERROR, CLEAR_ERROR } from 'interface/actions/error';

export default function error(state = null, action) {
  switch (action.type) {
    case SET_ERROR:
      return action.payload;
    case CLEAR_ERROR:
      return null;
    default:
      return state;
  }
}
