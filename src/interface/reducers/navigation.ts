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
  pull?: 'all' | number;
}

const initialState: NavigationState = {};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    reset: () => initialState,
    clearReport: (state) => ({ ...state, report: undefined }),
    clearFight: (state) => ({ ...state, fight: undefined, pull: undefined }),
    setReport: (state, action: PayloadAction<{ link: string; title: string }>) => ({
      ...state,
      report: { link: action.payload.link, title: action.payload.title },
    }),
    setFight: (state, action: PayloadAction<{ link: string; title: string }>) => ({
      ...state,
      fight: { link: action.payload.link, title: action.payload.title },
    }),
    clearPull: (state) => ({ ...state, pull: undefined }),
    setPull: (state, action: PayloadAction<{ id: 'all' | number }>) => ({
      ...state,
      pull: action.payload.id,
    }),
  },
});

export const { clearReport, clearFight, reset, setReport, setFight, clearPull, setPull } =
  navigationSlice.actions;
export const { reducer } = navigationSlice;
