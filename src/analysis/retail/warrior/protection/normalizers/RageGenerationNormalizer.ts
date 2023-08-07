import SPELLS from 'common/SPELLS';
import { TALENTS_WARRIOR } from 'common/TALENTS';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { AnyEvent, EventType, ResourceChangeEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

const UNNERVING_FOCUS_INCREASE = 0.5;
const HEAVY_REPERCUSSIONS_AMOUNT = 2;
const IMPENETRABLE_WALL_AMOUNT = 3;

class RageGenerationNormalizer extends EventsNormalizer {
  removeAdditiveRage(event: ResourceChangeEvent, amount: number): ResourceChangeEvent {
    const rageIncreaseWaste = amount - Math.max(amount - event.waste, 0);
    const remainingWaste = Math.max(event.waste - rageIncreaseWaste);
    const baseRageWaste = event.resourceChange - Math.max(event.resourceChange - remainingWaste, 0);

    event.__modified = true;
    event.resourceChange -= amount;
    event.waste = baseRageWaste;

    const newEvent: ResourceChangeEvent = {
      ...event,
      __fabricated: true,
      waste: rageIncreaseWaste,
      resourceChange: amount,
    };

    return newEvent;
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    const hasHR = this.selectedCombatant.hasTalent(TALENTS_WARRIOR.HEAVY_REPERCUSSIONS_TALENT);
    const hasIW = this.selectedCombatant.hasTalent(TALENTS_WARRIOR.IMPENETRABLE_WALL_TALENT);
    const hasUF = this.selectedCombatant.hasTalent(TALENTS_WARRIOR.UNNERVING_FOCUS_TALENT);

    // if we don't have any of these talents just return the events that already existed
    if (!hasHR && !hasIW && !hasUF) {
      return events;
    }

    const updatedEvents: AnyEvent[] = [];
    let hasLastStand = false;

    events.forEach((event: AnyEvent) => {
      updatedEvents.push(event);

      // Lets handle UF first
      if (hasUF) {
        // Step 1 buff apply / removal
        if (event.type === EventType.ApplyBuff) {
          hasLastStand = true;
        }

        if (event.type === EventType.RemoveBuff) {
          hasLastStand = false;
        }

        // Step 2. handle all resource change events
        if (hasLastStand) {
          if (event.type === EventType.ResourceChange) {
            const rawResourceChange = event.resourceChange;
            // Step 2.a find our increase
            const rageIncrease =
              rawResourceChange - rawResourceChange / (1 + UNNERVING_FOCUS_INCREASE);
            const baseRage = rawResourceChange - rageIncrease;
            // Step 2.b Noramlize to no decimals (no fractional rage)
            const noDecimalRageIncrease = Math.floor(rageIncrease);
            const noDecmialBaseRage = Math.ceil(baseRage);
            // Step 2.c Find how much waste we have for each event
            const rageIncreaseWaste =
              noDecimalRageIncrease - Math.max(noDecimalRageIncrease - event.waste, 0);
            const remainingWaste = Math.max(event.waste - rageIncreaseWaste);
            const baseRageWaste =
              noDecmialBaseRage - Math.max(noDecmialBaseRage - remainingWaste, 0);
            // Step 2.d update base event
            event.waste = baseRageWaste;
            event.resourceChange = noDecmialBaseRage;
            event.__modified = true;
            // Step 2.e create new event
            const newEvent: ResourceChangeEvent = {
              ...event,
              __fabricated: true,
              waste: rageIncreaseWaste,
              resourceChange: noDecimalRageIncrease,
              ability: {
                abilityIcon: TALENTS_WARRIOR.UNNERVING_FOCUS_TALENT.icon,
                guid: TALENTS_WARRIOR.UNNERVING_FOCUS_TALENT.id,
                name: TALENTS_WARRIOR.UNNERVING_FOCUS_TALENT.name,
                // This is so illegal but there is no good way... but we are warriors and its resource change so its okay (?)
                type: MAGIC_SCHOOLS.ids.PHYSICAL,
              },
            };
            updatedEvents.push(newEvent);
          }
        }
      }

      // lets move onto Heavy Repercussions
      if (hasHR) {
        if (event.type === EventType.ResourceChange) {
          if (event.ability.guid === SPELLS.SHIELD_SLAM.id) {
            const newEvent = this.removeAdditiveRage(event, HEAVY_REPERCUSSIONS_AMOUNT);
            newEvent.ability = {
              abilityIcon: TALENTS_WARRIOR.HEAVY_REPERCUSSIONS_TALENT.icon,
              guid: TALENTS_WARRIOR.HEAVY_REPERCUSSIONS_TALENT.id,
              name: TALENTS_WARRIOR.HEAVY_REPERCUSSIONS_TALENT.name,
              type: MAGIC_SCHOOLS.ids.PHYSICAL,
            };
            updatedEvents.push(newEvent);
          }
        }
      }

      // lets move onto Impenetrable Wall
      if (hasIW) {
        if (event.type === EventType.ResourceChange) {
          if (event.ability.guid === SPELLS.SHIELD_SLAM.id) {
            const newEvent = this.removeAdditiveRage(event, IMPENETRABLE_WALL_AMOUNT);
            newEvent.ability = {
              abilityIcon: TALENTS_WARRIOR.IMPENETRABLE_WALL_TALENT.icon,
              guid: TALENTS_WARRIOR.IMPENETRABLE_WALL_TALENT.id,
              name: TALENTS_WARRIOR.IMPENETRABLE_WALL_TALENT.name,
              type: MAGIC_SCHOOLS.ids.PHYSICAL,
            };
            updatedEvents.push(newEvent);
          }
        }
      }
    });

    return updatedEvents;
  }
}

export default RageGenerationNormalizer;
