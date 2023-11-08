import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Report from 'parser/core/Report';

export type ReportState = Report | null;
const initialState = null as ReportState;

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    resetSlice: () => initialState,
    setReport(_state: ReportState, action: PayloadAction<Report | null>) {
      return action.payload;
    },
  },
});

export const { resetSlice, setReport } = reportSlice.actions;
export default reportSlice.reducer;
