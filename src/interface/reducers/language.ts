import Cookies from 'universal-cookie';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const cookies = new Cookies();
const COOKIE_NAME = 'LANGUAGE';
const cookieOptions = {
  path: '/',
  maxAge: 86400 * 365, // 1 year
};
export type LanguageState = string;

const initialState: LanguageState = cookies.get(COOKIE_NAME) || 'en';

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

export const { resetSlice, setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
