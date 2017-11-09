import { SET_ERROR } from 'actions/error';

export default function error(state = null, action) {
  switch (action.type) {
    case SET_ERROR:
      return action.payload;
    default:
      return state;
  }
}
