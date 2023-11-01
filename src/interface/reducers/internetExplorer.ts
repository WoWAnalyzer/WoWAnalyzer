import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type InternetExplorerState = boolean;

const initialState: InternetExplorerState = false;

const internetExplorerSlice = createSlice({
  name: 'internetExplorer',
  initialState,
  reducers: {
    resetSlice: () => initialState,
    setInternetExplorer(state, action: PayloadAction<boolean>) {
      return action.payload;
    },
  },
});

export const { resetSlice, setInternetExplorer } = internetExplorerSlice.actions;
export default internetExplorerSlice.reducer;
