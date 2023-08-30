import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/warrior';
import HIT_TYPES from 'game/HIT_TYPES';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import RESOURCE_TYPES, { Resource } from 'game/RESOURCE_TYPES';
import {
  AnyEvent,
  CastEvent,
  EventType,
  HasSource,
  HasTarget,
  ResourceChangeEvent,
} from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

// Rage From getting Autoed
const RAGE_PER_MELEE_HIT_TAKEN = 3;
const RAGE_GEN_FROM_MELEE_HIT_ICD = 1000; //ms

// Auto Attacks
const RAGE_PER_AUTO = 2;
const INSTIGATE_AUTO_INCREASE = 1;
const WARMACHINE_INCREASE = 0.5;

// Generic Multiplier
const UNNERVING_FOCUS_INCREASE = 0.5;

// Shield Slam
const HEAVY_REPERCUSSIONS_AMOUNT = 2;
const IMPENETRABLE_WALL_AMOUNT = 3;

// Devastator
const INSTIGATE_DEVASTATOR_INCREASE = 2;

// Spear
const PIERCING_VERDICT_INCREASE = 1;

// Ravager
const STORM_OF_STEEL_INCREASE = 10;

// Demo shout
const BOOMING_VOICE_INCREASE = 30;

class RageGenerationNormalizer extends EventsNormalizer {
  _removeMultiplicitiveIncrease(
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
        abilityIcon: referenceTalent.icon,
        guid: referenceTalent.id,
        name: referenceTalent.name,
        // This is so illegal but there is no good way...
        type: MAGIC_SCHOOLS.ids.PHYSICAL,
      },
    };

    return newEvent;
  }

  _removeAdditiveIncrease(
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

  /**
   * This returns the amount rage generated by an event abstractly
   * This is how we track *can* slightly track invisible resource change events
   * @param event Any possible event
   * @returns Returns the amount of rage generated from this event
   */
  _attemptToUpdateRageCount(event: AnyEvent): number {
    if (!('classResources' in event)) {
      return 0;
    }

    const rage = event.classResources?.find((resource) => resource.type === RESOURCE_TYPES.RAGE.id);
    if (!rage) {
      return 0;
    }

    const generated = Math.max(rage.amount - this.lastRageCount, 0);
    this.lastRageCount = rage.amount;
    this.maxRage = rage.max;
    return generated / 10;
  }

  _fromSelf(event: AnyEvent): boolean {
    return HasSource(event) && event.sourceID === this.selectedCombatant.id;
  }

  _toYou(event: AnyEvent) {
    return HasTarget(event) && event.targetID === this.selectedCombatant.id;
  }

  _coerceCastToResourceChange(
    event: CastEvent,
    resourceChange: number,
    waste: number,
    resourceType: Resource,
  ): ResourceChangeEvent {
    // gather required data
    const rage = event.classResources?.find((resource) => resource.type === RESOURCE_TYPES.RAGE.id);
    const maxRage = rage?.max;

    const modifiableEvent = JSON.parse(JSON.stringify(event));
    modifiableEvent.type = EventType.ResourceChange;
    // make sure we are saying this is fake
    modifiableEvent.__fabricated = true;
    // clean up cast fields... there is probably a better way to do this like cross referencing a cast event's keys and resource change evnet
    delete modifiableEvent.resourceCost;
    delete modifiableEvent.rawResourceCost;
    delete modifiableEvent.melee;
    // add the fields we need
    modifiableEvent.resourceChange = resourceChange;
    modifiableEvent.resourceChangeType = resourceType.id;
    modifiableEvent.otherResourceChange = 0;
    modifiableEvent.maxResourceAmount = maxRage;
    modifiableEvent.waste = waste;
    modifiableEvent.targetID = event.sourceID;

    return modifiableEvent as ResourceChangeEvent;
  }

  _seeIfDodgeOrParryInFuture(events: AnyEvent[], startIndex: number) {
    let wasDodgedOrParried = false;
    // quickly move forwaard and find the realted damage event
    // at most go forward 30 events
    for (let i = 0; i < 30; i += 1) {
      const innerEvent = events[startIndex + i];
      if (
        innerEvent.type === EventType.Damage &&
        this._toYou(innerEvent) &&
        innerEvent.ability.guid === SPELLS.MELEE.id
      ) {
        if (innerEvent.hitType === HIT_TYPES.DODGE || innerEvent.hitType === HIT_TYPES.PARRY) {
          wasDodgedOrParried = true;
          break;
        }
      }
    }
    return wasDodgedOrParried;
  }

  lastRageCount: number = 0;
  maxRage: number = 0;

  hasUF = false;

  hasHR = false;
  hasIW = false;

  hasWM = false;
  hasDevestator = false;
  hasInstigate = false;

  hasPV = false;

  hasSoS = false;

  hasBV = false;

  // This generates any new events we need before processing...
  // This is mainly invisible events such as meleeing and being meleed
  generateNewEvents(events: AnyEvent[]) {
    const updatedEvents: AnyEvent[] = [];

    let ragePerAuto =
      (RAGE_PER_AUTO + (this.hasDevestator && this.hasInstigate ? 1 : 0)) * (this.hasWM ? 1.5 : 1);
    let ragePerDamage = RAGE_PER_MELEE_HIT_TAKEN;
    let lastMeleeTake = 0;

    events.forEach((event, index) => {
      // Add this event no matter what
      updatedEvents.push(event);

      const rageGenerated = this._attemptToUpdateRageCount(event);

      if (this.hasUF) {
        if (
          event.type === EventType.ApplyBuff &&
          event.ability.guid === SPELLS.UNNERVING_FOCUS_BUFF.id
        ) {
          ragePerAuto *= 1 + UNNERVING_FOCUS_INCREASE;
          ragePerDamage *= 1 + UNNERVING_FOCUS_INCREASE;
        }

        if (
          event.type === EventType.RemoveBuff &&
          event.ability.guid === SPELLS.UNNERVING_FOCUS_BUFF.id
        ) {
          ragePerAuto /= 1 + UNNERVING_FOCUS_INCREASE;
          ragePerDamage /= 1 + UNNERVING_FOCUS_INCREASE;
        }
      }

      // if we are melee
      if (
        event.type === EventType.Cast &&
        this._fromSelf(event) &&
        event.ability.guid === SPELLS.MELEE.id
      ) {
        const rageWastedFromAuto = ragePerAuto - rageGenerated;
        const newEvent = this._coerceCastToResourceChange(
          event,
          ragePerAuto,
          rageWastedFromAuto,
          RESOURCE_TYPES.RAGE,
        );
        updatedEvents.push(newEvent);
      }

      if (
        event.type === EventType.Cast &&
        this._toYou(event) &&
        event.ability.guid === SPELLS.MELEE.id
      ) {
        if (lastMeleeTake + RAGE_GEN_FROM_MELEE_HIT_ICD > event.timestamp) {
          if (!this._seeIfDodgeOrParryInFuture(events, index)) {
            lastMeleeTake = event.timestamp;
            const netRage = this.lastRageCount + ragePerDamage;
            const netWaste = Math.max(netRage - this.maxRage, 0);

            const newEvent = this._coerceCastToResourceChange(
              event,
              ragePerDamage,
              netWaste,
              RESOURCE_TYPES.RAGE,
            );
            newEvent.ability.abilityIcon = SPELLS.RAGE_DAMAGE_TAKEN.icon;
            newEvent.ability.guid = SPELLS.RAGE_DAMAGE_TAKEN.id;
            newEvent.ability.name = SPELLS.RAGE_DAMAGE_TAKEN.name;
            newEvent.sourceID = this.selectedCombatant.id;
            newEvent.sourceIsFriendly = true;
            newEvent.targetIsFriendly = true;

            updatedEvents.push(newEvent);
          }
        }
      }
    });
    return updatedEvents;
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    this.hasUF = this.selectedCombatant.hasTalent(TALENTS.UNNERVING_FOCUS_TALENT);

    // shield slam area
    this.hasHR = this.selectedCombatant.hasTalent(TALENTS.HEAVY_REPERCUSSIONS_TALENT);
    this.hasIW = this.selectedCombatant.hasTalent(TALENTS.IMPENETRABLE_WALL_TALENT);

    // auto attacks
    this.hasWM = this.selectedCombatant.hasTalent(TALENTS.WAR_MACHINE_PROTECTION_TALENT);
    this.hasDevestator = this.selectedCombatant.hasTalent(TALENTS.DEVASTATOR_TALENT);
    this.hasInstigate = this.selectedCombatant.hasTalent(TALENTS.INSTIGATE_TALENT);

    // spear of bastion
    this.hasPV = this.selectedCombatant.hasTalent(TALENTS.PIERCING_VERDICT_TALENT);

    // ravager
    this.hasSoS = this.selectedCombatant.hasTalent(TALENTS.STORM_OF_STEEL_TALENT);

    // booming voice
    this.hasBV = this.selectedCombatant.hasTalent(TALENTS.BOOMING_VOICE_TALENT);

    const updatedEvents: AnyEvent[] = [];
    let hasUnnervingFocus = false;

    this.generateNewEvents(events).forEach((event: AnyEvent) => {
      updatedEvents.push(event);

      // this return is used for auto attacks but we call it here to make sure we haven't factored anything out yet

      // Lets handle UF first
      if (this.hasUF) {
        // Step 1 buff apply / removal
        if (
          event.type === EventType.ApplyBuff &&
          event.ability.guid === SPELLS.UNNERVING_FOCUS_BUFF.id
        ) {
          hasUnnervingFocus = true;
        }

        if (
          event.type === EventType.RemoveBuff &&
          event.ability.guid === SPELLS.UNNERVING_FOCUS_BUFF.id
        ) {
          hasUnnervingFocus = false;
        }

        // Step 2. handle all resource change events
        if (hasUnnervingFocus) {
          if (event.type === EventType.ResourceChange) {
            const newEvent = this._removeMultiplicitiveIncrease(
              event,
              UNNERVING_FOCUS_INCREASE,
              TALENTS.UNNERVING_FOCUS_TALENT,
            );
            updatedEvents.push(newEvent);
          }
        }
      }

      if (event.type !== EventType.ResourceChange) {
        return;
      }

      // lets move onto Heavy Repercussions
      if (this.hasHR) {
        if (event.ability.guid === SPELLS.SHIELD_SLAM.id) {
          const newEvent = this._removeAdditiveIncrease(
            event,
            HEAVY_REPERCUSSIONS_AMOUNT,
            TALENTS.HEAVY_REPERCUSSIONS_TALENT,
          );
          updatedEvents.push(newEvent);
        }
      }

      // lets move onto Impenetrable Wall
      if (this.hasIW) {
        if (event.ability.guid === SPELLS.SHIELD_SLAM.id) {
          const newEvent = this._removeAdditiveIncrease(
            event,
            IMPENETRABLE_WALL_AMOUNT,
            TALENTS.IMPENETRABLE_WALL_TALENT,
          );
          updatedEvents.push(newEvent);
        }
      }

      // This is the auto attack area
      if (event.ability.guid === SPELLS.MELEE.id) {
        // rageGenerated
        // ragePerAutoAttackAdjusted

        // lets move onto War Machine
        if (this.hasWM) {
          const newEvent = this._removeMultiplicitiveIncrease(
            event,
            WARMACHINE_INCREASE,
            TALENTS.WAR_MACHINE_PROTECTION_TALENT,
          );
          updatedEvents.push(newEvent);
        }

        if (this.hasDevestator && this.hasInstigate) {
          const newEvent = this._removeAdditiveIncrease(
            event,
            INSTIGATE_AUTO_INCREASE,
            TALENTS.INSTIGATE_TALENT,
          );
          updatedEvents.push(newEvent);
        }
      }

      // Devastate area
      if (event.ability.guid === SPELLS.DEVASTATE.id) {
        if (!this.hasDevestator && this.hasInstigate) {
          const newEvent = this._removeAdditiveIncrease(
            event,
            INSTIGATE_DEVASTATOR_INCREASE,
            TALENTS.INSTIGATE_TALENT,
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
            TALENTS.PIERCING_VERDICT_TALENT,
          );
          updatedEvents.push(newEvent);
        }
      }

      if (this.hasSoS) {
        if (event.ability.guid === SPELLS.RAVAGER_ENERGIZE.id) {
          const newEvent = this._removeAdditiveIncrease(
            event,
            STORM_OF_STEEL_INCREASE,
            TALENTS.STORM_OF_STEEL_TALENT,
          );
          updatedEvents.push(newEvent);
        }
      }

      if (this.hasBV) {
        if (event.ability.guid === SPELLS.DEMORALIZING_SHOUT.id) {
          const newEvent = this._removeAdditiveIncrease(
            event,
            BOOMING_VOICE_INCREASE,
            TALENTS.BOOMING_VOICE_TALENT,
          );
          updatedEvents.push(newEvent);
        }
      }
    });

    return updatedEvents;
  }
}

export default RageGenerationNormalizer;
