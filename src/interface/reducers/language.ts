import Cookies from 'universal-cookie';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const cookies = new Cookies();
const COOKIE_NAME = 'LANGUAGE';
const cookieOptions = {
  path: '/',
  maxAge: 86400 * 365, // 1 year
};
type LanguageState = string;

// The language switcher is hidden until the interface has complete translations. Do not strand
// returning users in a previously selected, partially translated locale in the meantime.
const initialState: LanguageState = 'en';

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    resetSlice: () => initialState,
    setLanguage(_state, action: PayloadAction<string>) {
      cookies.set(COOKIE_NAME, action.payload, cookieOptions);
      return action.payload;
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
