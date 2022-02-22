import { SET_COMBATANTS } from 'interface/actions/combatants';
import { SET_REPORT } from 'interface/actions/report';
import { CombatantInfoEvent } from 'parser/core/Events';
import { AnyAction } from 'redux';

export type CombatantsState = CombatantInfoEvent[] | null;

export default function combatants(state: CombatantsState = null, action: AnyAction) {
  switch (action.type) {
    case SET_REPORT:
      return null;
    case SET_COMBATANTS:
      return action.payload;
    default:
      return state;
  }
}
