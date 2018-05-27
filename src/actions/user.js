export const SET_USER = 'SET_USER';
function setUser(user) {
  return {
    type: SET_USER,
    payload: user,
  };
}

export function fetchUser() {
  return dispatch => {
    return fetch(`${process.env.REACT_APP_API_BASE}user`, {
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
      .then(user => dispatch(setUser(user)));
  };
}
