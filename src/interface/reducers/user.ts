import { SET_USER, User } from 'interface/actions/user';
import { AnyAction } from 'redux';

// Possible values:
// null: unknown
// object: logged in user data
export default function user(state: User | null = null, action: AnyAction) {
  switch (action.type) {
    case SET_USER:
      return action.payload;
    default:
      return state;
  }
}
