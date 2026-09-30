import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NavigationState {
  report?: {
    link: string;
    title: string;
  };
  fight?: {
    link: string;
    title: string;
  };
}

const initialState: NavigationState = {};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    reset: () => initialState,
    clearReport: (state) => ({ ...state, report: undefined }),
    clearFight: (state) => ({ ...state, fight: undefined }),
    setReport: (state, action: PayloadAction<{ link: string; title: string }>) => ({
      ...state,
      report: { link: action.payload.link, title: action.payload.title },
    }),
    setFight: (state, action: PayloadAction<{ link: string; title: string }>) => ({
      ...state,
      fight: { link: action.payload.link, title: action.payload.title },
    }),
  },
});

export const { clearReport, clearFight, reset, setReport, setFight } = navigationSlice.actions;
export const { reducer } = navigationSlice;
