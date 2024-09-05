import SPELLS from 'common/SPELLS/warrior';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Combatant from 'parser/core/Combatant';
import { AnyEvent, EventType, ResourceActor } from 'parser/core/Events';

/**
 * Taking `event`, finds the classResource object if it is for `selectedCombatant`, and is rage.
 *
 * If the event does not have the necessary information, returns undefined.
 *
 * Some events where we ignore rage resource:
 * - Charge cast when it finishes seems to have the values of when it charged, so will be outdated.
 * - Heals seems to be showing the value when cast, not when landing, so will often be incorrect.
 */
export default function getRage(event: AnyEvent, selectedCombatant: Combatant) {
  if ('classResources' in event && 'resourceActor' in event) {
    if (
      (event.resourceActor === ResourceActor.Source &&
        event.sourceID === selectedCombatant.id &&
        event.ability?.guid !== SPELLS.CHARGE_2.id) ||
      (event.resourceActor === ResourceActor.Target &&
        event.targetID === selectedCombatant.id &&
        event.type !== EventType.Heal)
    ) {
      return event.classResources?.find((resource) => resource.type === RESOURCE_TYPES.RAGE.id);
    }
  }
}
