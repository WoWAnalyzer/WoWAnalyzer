export const SET_LANGUAGE = 'SET_LANGUAGE';
export function setLanguage(language: string) {
  return {
    type: SET_LANGUAGE,
    payload: language,
  };
}
