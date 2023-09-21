import { Spec } from 'game/SPECS';
import Combatant from './Combatant';

/**
 * We know that the "selected" combatant must have certain properties, otherwise the parser would not have selected it.
 *
 * This interface lets us access those properties without having to do a bunch of null checks.
 */
export default interface SelectedCombatant extends Combatant {
  spec: Spec;
}

/**
 * Should optimally check all the values we asure are present in {@link SelectedCombatant}.
 */
export function validSelectedCombatant(combatant: Combatant): combatant is SelectedCombatant {
  return combatant.spec != null;
}
