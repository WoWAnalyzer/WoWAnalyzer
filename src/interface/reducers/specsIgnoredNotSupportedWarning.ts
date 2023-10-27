import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SpecsIgnoredNotSupportedWarningState = number[];
const initialState: SpecsIgnoredNotSupportedWarningState =
  [] as SpecsIgnoredNotSupportedWarningState;

const specsIgnoredNotSupportedWarningSlice = createSlice({
  name: 'specsIgnoredNotSupportedWarning',
  initialState,
  reducers: {
    resetSlice: () => initialState,
    ignoreSpecNotSupportedWarning(state, action: PayloadAction<number>) {
      return [...state, action.payload];
    },
  },
});

export const { resetSlice, ignoreSpecNotSupportedWarning } =
  specsIgnoredNotSupportedWarningSlice.actions;
export default specsIgnoredNotSupportedWarningSlice.reducer;
