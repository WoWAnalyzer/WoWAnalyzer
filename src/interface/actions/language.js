export const SET_LANGUAGE = 'SET_LANGUAGE';
export function setLanguage(language) {
  return {
    type: SET_LANGUAGE,
    payload: language,
  };
}
