import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ReportCodesIgnoredPreviousPatchWarning = string[];
const initialState: ReportCodesIgnoredPreviousPatchWarning =
  [] as ReportCodesIgnoredPreviousPatchWarning;

const reportCodesIgnoredPreviousPatchWarningSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    resetSlice: () => initialState,
    ignorePreviousPatchWarning(
      state: ReportCodesIgnoredPreviousPatchWarning,
      action: PayloadAction<string>,
    ) {
      return [...state, action.payload];
    },
  },
});

export const { resetSlice, ignorePreviousPatchWarning } =
  reportCodesIgnoredPreviousPatchWarningSlice.actions;
export default reportCodesIgnoredPreviousPatchWarningSlice.reducer;
