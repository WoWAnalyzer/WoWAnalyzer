import calculateResourceIncrease from 'analysis/retail/warrior/shared/calculateResourceIncrease';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/warrior';
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
import {
  WARLORDS_TORMENT_RECKLESSNESS_INCREASE,
  WARMACHINE_ARMS_INCREASE,
  WARMACHINE_FURY_INCREASE,
  WARMACHINE_PROT_INCREASE,
} from './constants';

// Recklessness
const RECKLESSNESS_INCREASE = 1;

// Spear
const PIERCING_CHALLENGE_INCREASE = 1;

// Ravager
const STORM_OF_STEEL_INCREASE = 10;

/**
 * Modifies all rage events to add separate events for talents/buffs that modify rage generation.
 *
 * Note that this normalizer expects that rage events already exists, and thus has to be run after
 * `GenerateRageEventsNormalizer`.
 */
export default class RageAttributeNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    const hasFuryWM = this.selectedCombatant.hasTalent(TALENTS.WAR_MACHINE_FURY_TALENT);
    const hasArmsWM = this.selectedCombatant.hasTalent(TALENTS.WAR_MACHINE_ARMS_TALENT);
    const hasProtWM = this.selectedCombatant.hasTalent(TALENTS.WAR_MACHINE_PROTECTION_TALENT);
    const hasPC = this.selectedCombatant.hasTalent(TALENTS.PIERCING_CHALLENGE_TALENT);
    const hasSoS = this.selectedCombatant.hasTalent(TALENTS.STORM_OF_STEEL_TALENT);

    let recklessnessBuff = false;
    const updatedEvents: AnyEvent[] = [];

    events.forEach((event: AnyEvent) => {
      updatedEvents.push(event);

      const additions: ResourceChangeEvent[] = [];

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

      if (event.type !== EventType.ResourceChange) {
        return;
      }

      if (recklessnessBuff) {
        if (
          // As far as I can tell, seasoned soldier is unaffected by recklessness
          event.ability.guid !== SPELLS.SEASONED_SOLDIER.id &&
          // "Refunds" are not boosted by Recklessness
          event.ability.guid !== TALENTS.IMPROVED_EXECUTE_ARMS_TALENT.id &&
          event.ability.guid !== TALENTS.CRITICAL_THINKING_ARMS_TALENT.id
        ) {
          const newEvent = removeMultiplicitiveIncrease(
            event,
            this.selectedCombatant.hasTalent(TALENTS.WARLORDS_TORMENT_TALENT)
              ? WARLORDS_TORMENT_RECKLESSNESS_INCREASE
              : RECKLESSNESS_INCREASE,
            SPELLS.RECKLESSNESS,
          );
          additions.push(newEvent);
        }
      }

      if (event.ability.guid === SPELLS.MELEE.id) {
        // War Machines
        if (hasFuryWM) {
          const newEvent = removeMultiplicitiveIncrease(
            event,
            WARMACHINE_FURY_INCREASE,
            SPELLS.WAR_MACHINE_TALENT_BUFF,
          );
          additions.push(newEvent);
        } else if (hasArmsWM) {
          const newEvent = removeMultiplicitiveIncrease(
            event,
            WARMACHINE_ARMS_INCREASE,
            SPELLS.WAR_MACHINE_TALENT_BUFF,
          );
          additions.push(newEvent);
        } else if (hasProtWM) {
          const newEvent = removeMultiplicitiveIncrease(
            event,
            WARMACHINE_PROT_INCREASE,
            SPELLS.WAR_MACHINE_TALENT_BUFF,
          );
          additions.push(newEvent);
        }
      }

      if (hasPC) {
        if (event.ability.guid === SPELLS.CHAMPIONS_SPEAR.id) {
          const newEvent = removeMultiplicitiveIncrease(
            event,
            PIERCING_CHALLENGE_INCREASE,
            TALENTS.PIERCING_CHALLENGE_TALENT,
          );
          additions.push(newEvent);
        }
      }

      if (hasSoS) {
        if (event.ability.guid === SPELLS.RAVAGER_ENERGIZE.id) {
          const newEvent = removeAdditiveIncrease(
            event,
            STORM_OF_STEEL_INCREASE,
            TALENTS.STORM_OF_STEEL_TALENT,
          );
          additions.push(newEvent);
        }
      }

      updatedEvents.push(
        // Since each subsequent modification will adjust the original rage.amount,
        // we apply them in reverse order to ensure the rage.amount is correct.
        ...additions.reverse(),
      );
    });

    return updatedEvents;
  }
}

function removeMultiplicitiveIncrease(
  event: ResourceChangeEvent,
  amount: number,
  referenceTalent: Spell,
): ResourceChangeEvent {
  const { base, bonus } = calculateResourceIncrease(event, amount);

  // Update base event
  event.__modified = true;
  event.resourceChange = base.gain + base.waste;
  event.waste = base.waste;

  const originalRage = _getRage(event);

  if (!originalRage) {
    throw new Error('Original rage not found');
  }

  // Create new event
  const newEvent: ResourceChangeEvent = {
    __fabricated: true,
    waste: bonus.waste,
    resourceChange: bonus.gain + bonus.waste,
    ability: {
      abilityIcon: referenceTalent.icon,
      guid: referenceTalent.id,
      name: referenceTalent.name,
      type: MAGIC_SCHOOLS.ids.PHYSICAL,
    },
    classResources: [
      {
        type: RESOURCE_TYPES.RAGE.id,
        amount: originalRage.amount,
        max: originalRage.max,
      },
    ],

    sourceID: event.sourceID,
    sourceIsFriendly: true,
    targetID: event.targetID,
    targetIsFriendly: true,
    resourceChangeType: RESOURCE_TYPES.RAGE.id,
    otherResourceChange: 0,
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
    type: EventType.ResourceChange,
    timestamp: event.timestamp,
  };

  // Since original event will not bring to correct rage amount, we need to adjust it
  event.classResources = [
    {
      type: RESOURCE_TYPES.RAGE.id,
      amount: originalRage.amount - bonus.gain,
      max: originalRage.max,
    },
  ];

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

function _getRage(event: AnyEvent) {
  return (
    ('classResources' in event &&
      event.classResources?.find((resource) => resource.type === RESOURCE_TYPES.RAGE.id)) ||
    undefined
  );
}
