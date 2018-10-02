import { SET_USER } from 'interface/actions/user';

export default function user(state = null, action) {
  switch (action.type) {
    case SET_USER:
      return action.payload;
    default:
      return state;
  }
}
