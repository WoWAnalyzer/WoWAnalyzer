import getRage from 'analysis/retail/warrior/shared/utils/getRage';
import SPELLS from 'common/SPELLS';
import { TALENTS_WARRIOR } from 'common/TALENTS';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { AnyEvent, EventType, ResourceActor, ResourceChangeEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { damageEvent as executeDamageEvent } from './ExecuteLinkNormalizer';

/**
 * Normalizer that fabricates ResrouceChange events for the Improved Execute talent.
 *
 * Whenever Execute lands without killing the target, return 10% of the rage cost.
 *
 * Attributes the Rage refund to the Improved Execute talent.
 */
export default class ImprovedExecuteNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    const updatedEvents: AnyEvent[] = [];

    for (const event of events) {
      updatedEvents.push(event);

      if (
        event.type === EventType.Cast &&
        event.sourceID === this.selectedCombatant.id &&
        (event.ability.guid === SPELLS.EXECUTE.id ||
          event.ability.guid === SPELLS.EXECUTE_GLYPHED.id)
      ) {
        const rage = getRage(event, this.selectedCombatant);

        if (rage?.cost != null && rage.cost > 0) {
          const damageEvent = executeDamageEvent(event);
          if (damageEvent?.overkill == null || damageEvent?.overkill < 0) {
            // Possible this should be .floor() instead of .round()
            const refund = Math.round(rage.cost * 0.1);

            const newEvent: ResourceChangeEvent = {
              resourceChange: refund,

              type: EventType.ResourceChange,
              timestamp: event.timestamp,
              ability: {
                abilityIcon: TALENTS_WARRIOR.IMPROVED_EXECUTE_ARMS_TALENT.icon,
                name: TALENTS_WARRIOR.IMPROVED_EXECUTE_ARMS_TALENT.name,
                guid: TALENTS_WARRIOR.IMPROVED_EXECUTE_ARMS_TALENT.id,
                type: MAGIC_SCHOOLS.ids.PHYSICAL,
              },
              sourceID: this.selectedCombatant.id,
              sourceIsFriendly: true,
              targetID: this.selectedCombatant.id,
              targetIsFriendly: true,
              resourceActor: ResourceActor.Source,
              resourceChangeType: RESOURCE_TYPES.RAGE.id,
              waste: 0,
              otherResourceChange: 0,
              classResources: [
                {
                  type: RESOURCE_TYPES.RAGE.id,
                  amount:
                    event!.classResources![0]!.amount - event!.classResources![0]!.cost + refund,
                  max: event!.classResources![0].max,
                },
              ],
              hitPoints: event.hitPoints!,
              maxHitPoints: event.maxHitPoints!,
              attackPower: event.attackPower!,
              spellPower: event.spellPower!,
              armor: event.armor!,
              x: event.x!,
              y: event.y!,
              facing: event.facing!,
              mapID: event.mapID!,
              itemLevel: event.itemLevel!,
            };

            updatedEvents.push(newEvent);
          }
        }
      }
    }

    return updatedEvents;
  }
}
