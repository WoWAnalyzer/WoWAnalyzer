import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TooltipsState {
  baseUrl: string;
}

const initialState: TooltipsState = {
  baseUrl: 'https://wowhead.com/',
};

const tooltipsSlice = createSlice({
  name: 'tooltips',
  initialState,
  reducers: {
    reset: () => initialState,
    setBaseUrl(state, action: PayloadAction<string>) {
      return { ...state, baseUrl: action.payload };
    },
  },
});

export const { reset, setBaseUrl } = tooltipsSlice.actions;
export default tooltipsSlice.reducer;
