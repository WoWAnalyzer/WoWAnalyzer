import { captureException } from 'common/errorLogger';

export const SET_USER = 'SET_USER';
function setUser(user) {
  return {
    type: SET_USER,
    payload: user,
  };
}

export function logout() {
  return dispatch => {
    dispatch(setUser(null));
    return fetch(`${process.env.REACT_APP_SERVER_BASE}logout`, {
      credentials: 'include',
    })
      .catch(err => {
        captureException(err);
        console.error(err);
        // fail silently since this only enhances the experience, if we're shortly down it shouldn't *kill* the experience.
      });
  };
}

export function fetchUser() {
  return dispatch => {
    return fetch(`${process.env.REACT_APP_SERVER_BASE}user`, {
      credentials: 'include',
    })
      .then(response => {
        if (response.status !== 200) {
          if (response.status === 401) {
            // Unauthorized
            return null;
          }
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then(user => dispatch(setUser(user)))
      .catch(err => {
        captureException(err);
        console.error(err);
        // fail silently since this only enhances the experience, if we're shortly down it shouldn't *kill* the experience.
      });
  };
}
