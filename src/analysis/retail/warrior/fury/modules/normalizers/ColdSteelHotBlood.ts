import { RAGE_SCALE_FACTOR } from 'analysis/retail/warrior/shared/modules/normalizers/rage/constants';
import getRage from 'analysis/retail/warrior/shared/utils/getRage';
import SPELLS from 'common/SPELLS/warrior';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import {
  AnyEvent,
  EventType,
  HasTarget,
  ResourceActor,
  ResourceChangeEvent,
} from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

const CSHB_RAGE = 40;

/**
 * When recklessness is up, CSHB seems to award 4.8 (48) rage rather than just 4.
 * However, the "resourceChange" is still only 40...
 *
 * This normalizer adds another resourceChange event, attributed to Recklessness
 * for the extra 0.8 (8) rage.
 */
class ColdSteelHotBloodNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    let recklessnessBuff = false;
    // While it would be nice to adjust for overwhelming rage, we can't check combatant talents in normalizer
    let maxRage = 100 / RAGE_SCALE_FACTOR;
    let lastRageCount = 0;
    const updatedEvents: AnyEvent[] = [];

    events.forEach((event) => {
      updatedEvents.push(event);

      if (
        HasTarget(event) &&
        event.targetID === this.selectedCombatant.id &&
        event.ability.guid === SPELLS.RECKLESSNESS.id
      ) {
        if (event.type === EventType.ApplyBuff) {
          recklessnessBuff = true;
        } else if (event.type === EventType.RemoveBuff) {
          recklessnessBuff = false;
        }
      }

      const rage = getRage(event, this.selectedCombatant);

      if (
        event.type === EventType.ResourceChange &&
        event.ability.guid === SPELLS.COLD_STEEL_HOT_BLOOD_RAGE.id &&
        recklessnessBuff
      ) {
        if (rage == null) {
          return;
        }

        // So that the amount after CSHB itself is applied is correct
        rage.amount =
          // If we not capped
          rage.amount < rage.max
            ? // we can just subtract without worries
              rage.amount - CSHB_RAGE * 0.2
            : // if we're capped, we count from last known rage
              Math.min(lastRageCount + CSHB_RAGE, maxRage);

        // Create a new event
        const resourceChange = CSHB_RAGE * 0.2;
        const waste = Math.max(0, rage.amount + resourceChange - rage.max);
        lastRageCount = Math.min(rage.amount + resourceChange, rage.max);

        const extraRageEvent: ResourceChangeEvent = {
          type: EventType.ResourceChange,
          timestamp: event.timestamp,
          ability: {
            abilityIcon: SPELLS.RECKLESSNESS.icon,
            guid: SPELLS.RECKLESSNESS.id,
            name: SPELLS.RECKLESSNESS.name,
            type: MAGIC_SCHOOLS.ids.PHYSICAL,
          },
          classResources: [
            {
              type: RESOURCE_TYPES.RAGE.id,
              amount: lastRageCount,
              max: rage.max,
            },
          ],
          resourceChangeType: RESOURCE_TYPES.RAGE.id,
          resourceChange,
          waste,
          otherResourceChange: 0,
          sourceID: this.selectedCombatant.id,
          sourceIsFriendly: true,
          targetID: this.selectedCombatant.id,
          targetIsFriendly: true,
          resourceActor: ResourceActor.Source,
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

        updatedEvents.push(extraRageEvent);
      } else {
        if (rage) {
          // Whatever the event, if it tells us the current rage, that helps us figure out
          // auto attack rage
          lastRageCount =
            rage.amount -
            // We already know cost will be subtracted, so we can adjust for that
            (rage.cost ?? 0);
          maxRage = rage.max;
        }
      }
    });

    return updatedEvents;
  }
}

export default ColdSteelHotBloodNormalizer;
