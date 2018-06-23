import fetchEvents from 'common/fetchEvents';

export const SET_COMBATANTS = 'SET_COMBATANTS';
export function setCombatants(combatants) {
  return {
    type: SET_COMBATANTS,
    payload: combatants,
  };
}
export function fetchCombatants(code, start, end) {
  return async dispatch => {
    dispatch(setCombatants(null));
    const combatants = await fetchEvents(code, start, end, undefined, 'type="combatantinfo"');
    dispatch(setCombatants(combatants));
  };
}
