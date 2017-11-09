export const SET_ERROR = 'SET_ERROR';
export function setError(error) {
  return {
    type: SET_ERROR,
    payload: error,
  };
}
