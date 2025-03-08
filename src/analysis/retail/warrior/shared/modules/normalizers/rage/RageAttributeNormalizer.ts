import getRage from 'analysis/retail/warrior/shared/utils/getRage';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/warrior';
import { formatDuration } from 'common/format';
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
  PIERCING_CHALLENGE_INCREASE,
  RAGE_SCALE_FACTOR,
  RECKLESSNESS_INCREASE,
  STORM_OF_STEEL_INCREASE,
  WARLORDS_TORMENT_RECKLESSNESS_INCREASE,
  WARMACHINE_INCREASE,
} from './constants';

const DEBUG = false;

/**
 * Separates `ResourceChangeEvent` events into multiple events to atributte rage changes to spells and talents.
 *
 * This normalizer is reliant on all necessary ResourceChangeEvents being available, and will only work to attribute
 * rage to certain spells. If rage is mismatching before this normalizer, it will not be fixed.
 */
export default class RageAttributeNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    const hasWM = this.selectedCombatant.hasTalent(TALENTS.WAR_MACHINE_TALENT);
    const hasPC = this.selectedCombatant.hasTalent(TALENTS.PIERCING_CHALLENGE_TALENT);
    const hasSoS = this.selectedCombatant.hasTalent(TALENTS.STORM_OF_STEEL_TALENT);
    const hasRA = this.selectedCombatant.hasTalent(TALENTS.RECKLESS_ABANDON_TALENT);

    const WM_INCREASE = WARMACHINE_INCREASE[this.selectedCombatant.specId];

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

      if (
        event.resourceActor === ResourceActor.Source &&
        event.sourceID !== this.selectedCombatant.id
      ) {
        // Resource event is not for the selected combatant
        return;
      }

      if (
        event.resourceActor === ResourceActor.Target &&
        event.targetID !== this.selectedCombatant.id
      ) {
        // Resource event is not for the selected combatant
        return;
      }

      if (!event.classResources.some((resource) => resource.type === RESOURCE_TYPES.RAGE.id)) {
        // Resource event is not for rage
        return;
      }

      // Store original values, only for logging purposes
      const originalResourceChange = event.resourceChange;
      const originalWaste = event.waste;

      if (recklessnessBuff) {
        if (
          // As far as I can tell, seasoned soldier is unaffected by recklessness
          event.ability.guid !== SPELLS.SEASONED_SOLDIER.id &&
          // "Refunds" are not boosted by Recklessness
          event.ability.guid !== TALENTS.IMPROVED_EXECUTE_ARMS_TALENT.id &&
          event.ability.guid !== TALENTS.CRITICAL_THINKING_ARMS_TALENT.id &&
          event.ability.guid !== SPELLS.COLD_STEEL_HOT_BLOOD_RAGE.id &&
          event.ability.guid !== SPELLS.RECKLESSNESS.id
        ) {
          const newEvent = this.removeMultiplicitiveIncrease(
            event,
            this.selectedCombatant.hasTalent(TALENTS.WARLORDS_TORMENT_TALENT)
              ? WARLORDS_TORMENT_RECKLESSNESS_INCREASE
              : RECKLESSNESS_INCREASE,
            SPELLS.RECKLESSNESS,
          );
          additions.push(newEvent);
        }
      }

      if (event.ability.guid === SPELLS.MELEE.id || event.ability.guid === SPELLS.SKYFURY.id) {
        // War Machines
        if (hasWM) {
          const newEvent = this.removeMultiplicitiveIncrease(
            event,
            WM_INCREASE,
            SPELLS.WAR_MACHINE_TALENT_BUFF,
          );
          additions.push(newEvent);
        }
      }

      if (hasPC) {
        if (event.ability.guid === SPELLS.CHAMPIONS_SPEAR.id) {
          const newEvent = this.removeMultiplicitiveIncrease(
            event,
            PIERCING_CHALLENGE_INCREASE,
            TALENTS.PIERCING_CHALLENGE_TALENT,
          );
          additions.push(newEvent);
        }
      }

      if (hasSoS) {
        if (event.ability.guid === SPELLS.RAVAGER_ENERGIZE.id) {
          const newEvent = this.removeAdditiveIncrease(
            event,
            STORM_OF_STEEL_INCREASE / RAGE_SCALE_FACTOR,
            TALENTS.STORM_OF_STEEL_TALENT,
          );
          additions.push(newEvent);
        }
      }

      if (hasRA) {
        if (event.ability.guid === SPELLS.RECKLESSNESS.id) {
          const newEvent = this.removeAdditiveIncrease(
            event,
            50 / RAGE_SCALE_FACTOR,
            TALENTS.RECKLESS_ABANDON_TALENT,
          );
          additions.push(newEvent);
        }
      }

      updatedEvents.push(
        // For complicated reasons, we want the new events in reverse order to
        // to ensure "current rage" is correct after each step
        ...additions.toReversed(),
      );

      if (DEBUG) {
        const timestamp = formatDuration(event.timestamp - this.owner.fight.start_time, 3);
        const mainMessage = `[rageAttributeNormalizer] ${timestamp}: ${event.ability.name} (${event.ability.guid}), Gain: ${originalResourceChange - originalWaste}, Waste: ${originalWaste}, Total: ${originalResourceChange}`;

        if (additions.length > 0) {
          console.groupCollapsed(mainMessage);
          [event, ...additions.toReversed()].forEach((e) => {
            console.log(
              `${e.ability?.name} (${e?.ability?.guid}) - Gain: ${e.resourceChange - e.waste}, Waste: ${e.waste}, Total: ${e.resourceChange}`,
            );
          });
          console.groupEnd();
        } else {
          console.log(mainMessage);
        }
      }
    });

    return updatedEvents;
  }

  private removeMultiplicitiveIncrease(
    event: ResourceChangeEvent,
    /** Multiplicative increase. 10% increase = 0.1 */
    amount: number,
    referenceTalent: Spell,
  ): ResourceChangeEvent {
    const rawResourceChange = event.resourceChange;
    // Find our increase
    const resourceIncrease = Math.ceil(rawResourceChange - rawResourceChange / (1 + amount));
    const baseResource = rawResourceChange - resourceIncrease;
    // Find how much waste we have for each event
    const resourceIncreaseWaste = resourceIncrease - Math.max(resourceIncrease - event.waste, 0);
    const remainingWaste = event.waste - resourceIncreaseWaste;

    const base = {
      gain: baseResource - remainingWaste,
      waste: remainingWaste,
    };
    const bonus = {
      gain: resourceIncrease - resourceIncreaseWaste,
      waste: resourceIncreaseWaste,
    };

    return this.synthesizeEvent(event, base, bonus, referenceTalent);
  }

  private removeAdditiveIncrease(
    event: ResourceChangeEvent,
    /** How much of the resourceChange is the additive bonus */
    amount: number,
    referenceTalent: Spell,
  ): ResourceChangeEvent {
    const base = {
      gain: event.resourceChange - amount,
      waste: Math.max(0, event.waste - amount),
    };
    const bonus = {
      gain: amount,
      waste: Math.min(event.waste, amount),
    };

    return this.synthesizeEvent(event, base, bonus, referenceTalent);
  }

  private synthesizeEvent(
    event: ResourceChangeEvent,
    base: { gain: number; waste: number },
    bonus: { gain: number; waste: number },
    referenceTalent: Spell,
  ): ResourceChangeEvent {
    // Update base event
    event.__modified = true;
    event.resourceChange = base.gain + base.waste;
    event.waste = base.waste;

    const originalRage = getRage(event, this.selectedCombatant);

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
}
