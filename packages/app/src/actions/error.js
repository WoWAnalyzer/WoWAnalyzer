export const SET_ERROR = 'SET_ERROR';
export function setError(error, details) {
  return {
    type: SET_ERROR,
    payload: {
      error,
      details,
    },
  };
}
export const CLEAR_ERROR = 'CLEAR_ERROR';
export function clearError() {
  return {
    type: CLEAR_ERROR,
  };
}

export const REPORT_NOT_FOUND = 'REPORT_NOT_FOUND';
export function reportNotFoundError(details) {
  return setError(REPORT_NOT_FOUND, details);
}
export const API_DOWN = 'API_DOWN';
export function apiDownError(details) {
  return setError(API_DOWN, details);
}
export const UNKNOWN_NETWORK_ISSUE = 'UNKNOWN_NETWORK_ISSUE';
export function unknownNetworkIssueError(details) {
  return setError(UNKNOWN_NETWORK_ISSUE, details);
}
export const UNKNOWN = 'UNKNOWN';
export function unknownError(details) {
  return setError(UNKNOWN, details);
}
export const INTERNET_EXPLORER = 'INTERNET_EXPLORER';
export function internetExplorerError() {
  return setError(INTERNET_EXPLORER);
}
