import { SET_USER } from 'interface/actions/user';

// Possible values:
// null: unknown
// false: logged out
// object: logged in user data
export default function user(state = null, action) {
  switch (action.type) {
    case SET_USER:
      return action.payload;
    default:
      return state;
  }
}
