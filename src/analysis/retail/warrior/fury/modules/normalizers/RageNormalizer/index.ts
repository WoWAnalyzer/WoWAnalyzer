import { RAGE_SCALE_FACTOR } from 'analysis/retail/warrior/constants';
import WindfuryLinkNormalizer, {
  getWindfuryExtraAttack,
} from 'analysis/retail/warrior/shared/modules/normalizers/WindfuryLinkNormalizer';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import { TALENTS_WARRIOR } from 'common/TALENTS';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import RESOURCE_TYPES, { Resource } from 'game/RESOURCE_TYPES';
import { AnyEvent, CastEvent, EventType, HasSource, ResourceChangeEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

function getRage(event: AnyEvent) {
  return (
    ('classResources' in event &&
      event.classResources?.find((resource) => resource.type === RESOURCE_TYPES.RAGE.id)) ||
    undefined
  );
}

// Auto Attacks
// https://wowpedia.fandom.com/wiki/Rage
const MH_AUTO_ATTACK_RAGE_PS = 1.75;
// const MH_AUTO_ATTACK_RAGE_PS = 1.7476851851851862;
const OH_AUTO_ATTACK_RAGE_PS = 0.875;
// const OH_AUTO_ATTACK_RAGE_PS = 0.8680555555555556;

const DEFAULT_SPEED_2H = 3.6;
const DEFAULT_SPEED_1H = 2.6;

const RECKLESSNESS_INCREASE = 1;
const WARMACHINE_INCREASE = 0.2;

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

  private _fromSelf(event: AnyEvent): boolean {
    return HasSource(event) && event.sourceID === this.selectedCombatant.id;
  }

  private _coerceCastToResourceChange(
    event: CastEvent,
    resourceChange: number,
    waste: number,
    resourceType: Resource,
  ): ResourceChangeEvent {
    const modifiableEvent = structuredClone(event) as any;
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
    modifiableEvent.waste = waste;
    modifiableEvent.targetID = event.sourceID;

    return modifiableEvent as ResourceChangeEvent;
  }

  lastRageCount: number = 0;
  maxRage: number = 0;

  hasRecklessness = false;
  hasSMF = false;
  hasWM = false;
  hasPV = false;
  hasSoS = false;

  // This generates any new events we need before processing...
  // This is mainly invisible events such as meleeing and being meleed
  generateNewEvents(events: AnyEvent[]) {
    const updatedEvents: AnyEvent[] = [];

    const using1H = this.selectedCombatant.hasTalent(TALENTS_WARRIOR.SINGLE_MINDED_FURY_TALENT);
    const speed = using1H ? DEFAULT_SPEED_1H : DEFAULT_SPEED_2H;

    // While it would be nice to look at the speed or slot for weapons, I don't know if that's possible
    // so we'll just make the assumption that they have specced correctly if they are using 1h weapons
    let unbuffedRagePerSwingMH = MH_AUTO_ATTACK_RAGE_PS * speed;
    let unbuffedRagePerSwingOH = OH_AUTO_ATTACK_RAGE_PS * speed;

    if (this.hasWM) {
      unbuffedRagePerSwingMH += unbuffedRagePerSwingMH * WARMACHINE_INCREASE;
      unbuffedRagePerSwingOH += unbuffedRagePerSwingOH * WARMACHINE_INCREASE;
    }

    unbuffedRagePerSwingMH = Math.ceil(unbuffedRagePerSwingMH / RAGE_SCALE_FACTOR);
    unbuffedRagePerSwingOH = Math.ceil(unbuffedRagePerSwingOH / RAGE_SCALE_FACTOR);

    /** `true` if next swing _should_ be with offhand */
    let lastHitWasOffHand = true;
    let maxRage = 100 / RAGE_SCALE_FACTOR;
    let lastRageCount = 0;
    let recklessnessBuff = false;

    // As a side note, Annihilator rage triggers as energize event, so we don't need to worry about it here
    // https://www.warcraftlogs.com/reports/N9bWqMnrakAjZdJB#fight=2&type=resources&source=103&spell=101

    events.forEach((event, index) => {
      // Add this event no matter what
      updatedEvents.push(event);

      let ragePerSwingMH = unbuffedRagePerSwingMH;
      let ragePerSwingOH = unbuffedRagePerSwingOH;

      if (this.hasRecklessness) {
        if (event.type === EventType.ApplyBuff && event.ability.guid === SPELLS.RECKLESSNESS.id) {
          recklessnessBuff = true;
        } else if (
          event.type === EventType.RemoveBuff &&
          event.ability.guid === SPELLS.RECKLESSNESS.id
        ) {
          recklessnessBuff = false;
        }

        if (recklessnessBuff) {
          ragePerSwingMH = unbuffedRagePerSwingMH * (1 + RECKLESSNESS_INCREASE);
          ragePerSwingOH = unbuffedRagePerSwingOH * (1 + RECKLESSNESS_INCREASE);
        }
      }

      // auto-attack
      if (
        this._fromSelf(event) &&
        event.type === EventType.Cast &&
        event.ability.guid === SPELLS.MELEE.id
      ) {
        const rage = getRage(event);

        const generated = rage == null ? 0 : Math.max(rage?.amount - lastRageCount, 0);
        if (rage != null) {
          maxRage = rage.max;
        }
        const isMax = Math.ceil(rage ? rage.amount : lastRageCount) === Math.ceil(maxRage);

        // Handle windfury
        const extraAttack = getWindfuryExtraAttack(event);
        if (extraAttack) {
          // This is stupid, but if last hit was
          const isOffHand = extraAttack.ability.guid === SPELLS.WINDFURY_EXTRA_ATTACK_OH.id;

          const expectedGenration = isOffHand ? ragePerSwingMH : ragePerSwingOH;

          // We're at max, we've probably wasted rage
          let rageWasted = 0;
          if (isMax) {
            rageWasted = expectedGenration - generated;
          } else {
            rageWasted = 0;
          }

          const newEvent = {
            ...extraAttack,

            type: EventType.ResourceChange,

            __fabricated: true,
            ability: {
              ...extraAttack.ability,
              // Override id to always be mainhand for better tracking
              guid: SPELLS.WINDFURY_EXTRA_ATTACK_MH.id,
            },
            resourceChange: isMax ? expectedGenration : generated,
            resourceChangeType: RESOURCE_TYPES.RAGE.id,
            otherResourceChange: 0,
            waste: rageWasted,
          };

          updatedEvents.push(newEvent as any as ResourceChangeEvent);
        } else {
          // If we're not at max rage, we've generated the full amount, and we can use the
          // full amount to figure out if MH/OH
          const isOffHand =
            // If we are at max rage, we don't know how much the hit would have generated
            // If generated was 0 (probably a miss)
            isMax || generated < 1
              ? !lastHitWasOffHand
              : // If we are not at max rage, the generated value is
                generated < (ragePerSwingMH + ragePerSwingOH) / 2;

          const expectedGenration = isOffHand ? ragePerSwingOH : ragePerSwingMH;

          // We're at max, we've probably wasted rage
          let rageWastedFromAuto = 0;
          if (isMax) {
            rageWastedFromAuto = expectedGenration - generated;
          } else {
            rageWastedFromAuto = 0;
          }
          const newEvent = this._coerceCastToResourceChange(
            event,
            isMax ? expectedGenration : generated,
            rageWastedFromAuto,
            RESOURCE_TYPES.RAGE,
          );
          updatedEvents.push(newEvent);

          lastHitWasOffHand = isOffHand;
        }
      }

      if (this._fromSelf(event) && 'classResources' in event) {
        const rage = event.classResources?.find((r) => r.type === RESOURCE_TYPES.RAGE.id);
        if (rage) {
          // Whatever the event, if it tells us the current rage, that helps us figure out
          // auto attack rage
          lastRageCount = rage.amount;
          maxRage = rage.max;
        }
      }
    });
    return updatedEvents;
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    this.hasRecklessness = this.selectedCombatant.hasTalent(TALENTS_WARRIOR.RECKLESSNESS_TALENT);

    // auto attacks
    this.hasSMF = this.selectedCombatant.hasTalent(TALENTS_WARRIOR.SINGLE_MINDED_FURY_TALENT);
    this.hasWM = this.selectedCombatant.hasTalent(TALENTS_WARRIOR.WAR_MACHINE_FURY_TALENT);

    // spear of bastion
    this.hasPV = this.selectedCombatant.hasTalent(TALENTS_WARRIOR.PIERCING_VERDICT_TALENT);

    // ravager
    this.hasSoS = this.selectedCombatant.hasTalent(TALENTS_WARRIOR.STORM_OF_STEEL_TALENT);

    const updatedEvents: AnyEvent[] = [];

    const fixedGainEvents = events.map((event) => {
      if (!('resourceChange' in event) || !('waste' in event)) {
        return event;
      }

      return {
        ...event,
        resourceChange: event.resourceChange / RAGE_SCALE_FACTOR,
        waste: event.waste / RAGE_SCALE_FACTOR,
      };
    });
    this.generateNewEvents(fixedGainEvents).forEach((event: AnyEvent) => {
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
            WARMACHINE_INCREASE,
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
