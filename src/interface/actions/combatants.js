export const SET_COMBATANTS = 'SET_COMBATANTS';
export function setCombatants(combatants) {
  return {
    type: SET_COMBATANTS,
    payload: combatants,
  };
}
