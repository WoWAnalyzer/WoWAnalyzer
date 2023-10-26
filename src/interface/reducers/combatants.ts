import { CombatantInfoEvent } from 'parser/core/Events';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type CombatantsState = CombatantInfoEvent[] | null;

const initialState: CombatantsState = null;

const combatantsSlice = createSlice({
  name: 'combatants',
  initialState,
  reducers: {
    resetSlice: () => initialState,
    setCombatants(state: CombatantsState, action: PayloadAction<CombatantInfoEvent[] | null>) {
      console.log('setCombatants', action);
      state = action.payload;
    },
  },
});

export const { resetSlice, setCombatants } = combatantsSlice.actions;
export default combatantsSlice.reducer;
