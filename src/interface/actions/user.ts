import { captureException } from 'common/errorLogger';
import { ThunkAction } from 'redux-thunk';
import type { RootState } from 'store';
import { AnyAction } from 'redux';

export interface User {
  name: string;
  avatar?: string;
  premium: boolean;
  github?: {
    premium?: boolean;
    expires?: string;
  };
}

export const SET_USER = 'SET_USER';
function setUser(user: User | null) {
  return {
    type: SET_USER,
    payload: user,
  };
}

export function logout(): ThunkAction<void, RootState, unknown, AnyAction> {
  return (dispatch) => {
    dispatch(setUser(null));
    return fetch(`${process.env.REACT_APP_SERVER_BASE}logout`, {
      credentials: 'include',
    }).catch((err) => {
      captureException(err);
      console.error(err);
      // fail silently since this only enhances the experience, if we're shortly down it shouldn't *kill* the experience.
    });
  };
}

export function fetchUser(): ThunkAction<void, RootState, unknown, AnyAction> {
  return (dispatch) =>
    fetch(`${process.env.REACT_APP_SERVER_BASE}user`, {
      credentials: 'include',
    })
      .then((response) => {
        if (response.status !== 200) {
          if (response.status === 401) {
            // Unauthorized
            // We need to store this explicitely so we know the diff between "unknown" and "logged out"
            return false;
          }
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((user) => {
        dispatch(setUser(user));
        return user;
      })
      .catch((err) => {
        captureException(err, {
          extra: {
            location: 'user',
          },
        });
        // fail silently since this only enhances the experience, if we're shortly down it shouldn't *kill* the experience.
      });
}
