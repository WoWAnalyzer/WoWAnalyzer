export const SET_BASE_URL = 'tooltips/SET_BASE_URL';
export const setBaseUrl = (baseUrl: string) => ({ type: SET_BASE_URL, payload: baseUrl });

export const RESET = 'tooltips/RESET';
export const reset = () => ({ type: RESET });
