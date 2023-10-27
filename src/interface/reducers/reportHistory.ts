import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'universal-cookie';

interface ReportHistoryEntry {
  code: string;
  title?: string;
  start?: number;
  end: number;
  fightId?: number;
  fightName?: string;
  playerId?: number;
  playerName: string;
  playerRealm?: string;
  playerRegion?: string;
  playerClass: string;
  type: number;
}

const MAX_ITEMS = 5;
const cookies = new Cookies();
const COOKIE_NAME = 'REPORT_HISTORY';
const cookieOptions = {
  path: '/',
  maxAge: 86400 * 365, // 1 year
};

type ReportHistoryState = ReportHistoryEntry[];
const initialState: ReportHistoryState =
  cookies.get<ReportHistoryEntry[]>(COOKIE_NAME) || ([] as ReportHistoryState);

const reportHistorySlice = createSlice({
  name: 'reportHistory',
  initialState,
  reducers: {
    resetSlice: () => initialState,
    appendReportHistory(state: ReportHistoryState, action: PayloadAction<ReportHistoryEntry>) {
      let newState = [
        ...state.filter((item) => item.code !== action.payload.code), // remove existing report with this code
        action.payload,
      ];
      const numItems = newState.length;
      if (numItems > MAX_ITEMS) {
        newState = newState.slice(numItems - MAX_ITEMS);
      }
      cookies.set(COOKIE_NAME, newState, cookieOptions);
      state = [...newState];
    },
  },
});

export const { resetSlice, appendReportHistory } = reportHistorySlice.actions;
export default reportHistorySlice.reducer;
