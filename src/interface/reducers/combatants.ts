import { CombatantInfoEvent } from 'parser/core/Events';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type CombatantsState = CombatantInfoEvent[] | null;

const initialState: CombatantsState = null as CombatantsState;

const combatantsSlice = createSlice({
  name: 'combatants',
  initialState,
  reducers: {
    resetSlice: () => initialState,
    setCombatants(state: CombatantsState, action: PayloadAction<CombatantInfoEvent[] | null>) {
      return action.payload;
    },
  },
});

export const { setCombatants } = combatantsSlice.actions;
export default combatantsSlice.reducer;
