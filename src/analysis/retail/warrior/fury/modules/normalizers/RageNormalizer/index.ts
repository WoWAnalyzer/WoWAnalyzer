import WindfuryLinkNormalizer from 'analysis/retail/warrior/shared/modules/normalizers/WindfuryLinkNormalizer';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import { TALENTS_WARRIOR } from 'common/TALENTS';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { AnyEvent, EventType, ResourceChangeEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { WARMACHINE_FURY_INCREASE } from './constants';
import generateRageEvents from './generateRageEvents';
import scaleRageGainEvents from './scaleRageGainEvents';

// Spear
const PIERCING_VERDICT_INCREASE = 1;

// Ravager
const STORM_OF_STEEL_INCREASE = 10;

class RageNormalizer extends EventsNormalizer {
  static dependencies = {
    ...EventsNormalizer.dependencies,
    windfuryLinkNormalizer: WindfuryLinkNormalizer,
  };

  private _removeMultiplicitiveIncrease(
    event: ResourceChangeEvent,
    amount: number,
    referenceTalent: Spell,
  ): ResourceChangeEvent {
    const rawResourceChange = event.resourceChange;
    // Step 2.a find our increase
    const rageIncrease = rawResourceChange - rawResourceChange / (1 + amount);
    const baseRage = rawResourceChange - rageIncrease;
    // Step 2.b Noramlize to no decimals (no fractional rage)
    const noDecimalRageIncrease = Math.ceil(rageIncrease);
    const noDecmialBaseRage = Math.ceil(baseRage);
    // Step 2.c Find how much waste we have for each event
    const rageIncreaseWaste =
      noDecimalRageIncrease - Math.max(noDecimalRageIncrease - event.waste, 0);
    const remainingWaste = Math.max(event.waste - rageIncreaseWaste);
    const baseRageWaste = noDecmialBaseRage - Math.max(noDecmialBaseRage - remainingWaste, 0);
    // Step 2.d update base event
    event.__modified = true;
    event.resourceChange = noDecmialBaseRage;
    event.waste = baseRageWaste;
    // Step 2.e create new event
    const newEvent: ResourceChangeEvent = {
      ...event,
      __fabricated: true,
      waste: rageIncreaseWaste,
      resourceChange: noDecimalRageIncrease,
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

  private _removeAdditiveIncrease(
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

  lastRageCount: number = 0;
  maxRage: number = 0;

  hasRecklessness = false;
  hasWM = false;
  hasPV = false;
  hasSoS = false;

  normalize(events: AnyEvent[]): AnyEvent[] {
    events = scaleRageGainEvents(events);
    events = generateRageEvents(this.selectedCombatant, events);

    this.hasRecklessness = this.selectedCombatant.hasTalent(TALENTS_WARRIOR.RECKLESSNESS_TALENT);

    // auto attacks
    this.hasWM = this.selectedCombatant.hasTalent(TALENTS_WARRIOR.WAR_MACHINE_FURY_TALENT);

    // spear of bastion
    this.hasPV = this.selectedCombatant.hasTalent(TALENTS_WARRIOR.PIERCING_VERDICT_TALENT);

    // ravager
    this.hasSoS = this.selectedCombatant.hasTalent(TALENTS_WARRIOR.STORM_OF_STEEL_TALENT);

    const updatedEvents: AnyEvent[] = [];

    events.forEach((event: AnyEvent) => {
      updatedEvents.push(event);

      if (event.type !== EventType.ResourceChange) {
        return;
      }

      // This is the auto attack area
      if (event.ability.guid === SPELLS.MELEE.id) {
        // lets move onto War Machine
        if (this.hasWM) {
          const newEvent = this._removeMultiplicitiveIncrease(
            event,
            WARMACHINE_FURY_INCREASE,
            // Use same id as the buff to put in the same bucket
            SPELLS.WAR_MACHINE_TALENT_BUFF,
          );
          updatedEvents.push(newEvent);
        }
      }

      if (this.hasPV) {
        // Spear of Bastion Area
        if (event.ability.guid === SPELLS.SPEAR_OF_BASTION.id) {
          const newEvent = this._removeMultiplicitiveIncrease(
            event,
            PIERCING_VERDICT_INCREASE,
            TALENTS_WARRIOR.PIERCING_VERDICT_TALENT,
          );
          updatedEvents.push(newEvent);
        }
      }

      if (this.hasSoS) {
        if (event.ability.guid === SPELLS.RAVAGER_ENERGIZE.id) {
          const newEvent = this._removeAdditiveIncrease(
            event,
            STORM_OF_STEEL_INCREASE,
            TALENTS_WARRIOR.STORM_OF_STEEL_TALENT,
          );
          updatedEvents.push(newEvent);
        }
      }
    });

    return updatedEvents;
  }
}

export default RageNormalizer;
