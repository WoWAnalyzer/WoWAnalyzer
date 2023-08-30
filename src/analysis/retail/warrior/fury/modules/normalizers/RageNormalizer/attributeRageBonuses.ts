import calculateResourceIncrease from 'analysis/retail/warrior/shared/calculateResourceIncrease';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/warrior';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { AnyEvent, EventType, ResourceChangeEvent } from 'parser/core/Events';
import { WARMACHINE_FURY_INCREASE } from './constants';
import RageNormalizer from './index';

// Spear
const PIERCING_VERDICT_INCREASE = 1;

// Ravager
const STORM_OF_STEEL_INCREASE = 10;

/**
 * Modifies all rage events to add separate events for talents/buffs that modify rage generation.
 */
export default function attributeRageBonuses(this: RageNormalizer, events: AnyEvent[]): AnyEvent[] {
  // auto attacks
  const hasWM = this.selectedCombatant.hasTalent(TALENTS.WAR_MACHINE_FURY_TALENT);

  // spear of bastion
  const hasPV = this.selectedCombatant.hasTalent(TALENTS.PIERCING_VERDICT_TALENT);

  // ravager
  const hasSoS = this.selectedCombatant.hasTalent(TALENTS.STORM_OF_STEEL_TALENT);

  const updatedEvents: AnyEvent[] = [];

  events.forEach((event: AnyEvent) => {
    updatedEvents.push(event);

    if (event.type !== EventType.ResourceChange) {
      return;
    }

    // This is the auto attack area
    if (event.ability.guid === SPELLS.MELEE.id) {
      // lets move onto War Machine
      if (hasWM) {
        const newEvent = removeMultiplicitiveIncrease(
          event,
          WARMACHINE_FURY_INCREASE,
          // Use same id as the buff to put in the same bucket
          SPELLS.WAR_MACHINE_TALENT_BUFF,
        );
        updatedEvents.push(newEvent);
      }
    }

    if (hasPV) {
      // Spear of Bastion Area
      if (event.ability.guid === SPELLS.SPEAR_OF_BASTION.id) {
        const newEvent = removeMultiplicitiveIncrease(
          event,
          PIERCING_VERDICT_INCREASE,
          TALENTS.PIERCING_VERDICT_TALENT,
        );
        updatedEvents.push(newEvent);
      }
    }

    if (hasSoS) {
      if (event.ability.guid === SPELLS.RAVAGER_ENERGIZE.id) {
        const newEvent = removeAdditiveIncrease(
          event,
          STORM_OF_STEEL_INCREASE,
          TALENTS.STORM_OF_STEEL_TALENT,
        );
        updatedEvents.push(newEvent);
      }
    }
  });

  return updatedEvents;
}

function removeMultiplicitiveIncrease(
  event: ResourceChangeEvent,
  amount: number,
  referenceTalent: Spell,
): ResourceChangeEvent {
  const { base, bonus } = calculateResourceIncrease(event, amount);

  // Update base event
  event.__modified = true;
  event.resourceChange = base.gain;
  event.waste = base.waste;

  // Create new event
  const newEvent: ResourceChangeEvent = {
    ...event,
    __fabricated: true,
    waste: bonus.waste,
    resourceChange: bonus.gain,
    ability: {
      abilityIcon: referenceTalent.icon,
      guid: referenceTalent.id,
      name: referenceTalent.name,
      // This is so illegal but there is no good way...
      type: MAGIC_SCHOOLS.ids.PHYSICAL,
    },
  };

  return newEvent;
}

function removeAdditiveIncrease(
  event: ResourceChangeEvent,
  amount: number,
  referenceTalent: Spell,
): ResourceChangeEvent {
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
    ability: {
      abilityIcon: referenceTalent.icon,
      guid: referenceTalent.id,
      name: referenceTalent.name,
      // This is so illegal but there is no good way...
      type: MAGIC_SCHOOLS.ids.PHYSICAL,
    },
  };

  return newEvent;
}
