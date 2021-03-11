import { CombatantInfoEvent } from 'parser/core/Events';

export const SET_COMBATANTS = 'SET_COMBATANTS';
export function setCombatants(combatants: CombatantInfoEvent[] | null) {
  return {
    type: SET_COMBATANTS,
    payload: combatants,
  };
}
