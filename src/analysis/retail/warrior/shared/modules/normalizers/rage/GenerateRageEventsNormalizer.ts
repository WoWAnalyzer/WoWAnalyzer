import getRage from 'analysis/retail/warrior/shared/getRage';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import HIT_TYPES from 'game/HIT_TYPES';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SPECS from 'game/SPECS';
import {
  AddRelatedEvent,
  AnyEvent,
  CastEvent,
  DamageEvent,
  EventType,
  HasTarget,
  ResourceActor,
  ResourceChangeEvent,
} from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import WindfuryLinkNormalizer, {
  getWindfuryFromTrigger,
  getWindfuryFromTriggered,
} from 'parser/shared/normalizers/WindfuryLinkNormalizer';
import {
  RAGE_SCALE_FACTOR,
  RECKLESSNESS_INCREASE,
  SEASONED_SOLDIER_RAGE_INCREASE,
  WARLORDS_TORMENT_RECKLESSNESS_INCREASE,
  WARMACHINE_ARMS_INCREASE,
  WARMACHINE_FURY_INCREASE,
  WARMACHINE_PROT_INCREASE,
} from './constants';

const RAGE_RELATION = 'rage';

const BASE_RAGE_GENERATION = 1.75;
/**
 * Rage generation per second for all specs.
 *
 * This data is based on SimulationCraft data.
 *
 * https://github.com/simulationcraft/simc/blob/1817c80712ebf9d54a4a3aa4e95a05c774fed6f4/engine/class_modules/sc_warrior.cpp#L1916-L1948
 */
const AUTO_ATTACK_RAGE_PS = Object.freeze({
  ARMS: {
    // From SimulationCraft
    MH: BASE_RAGE_GENERATION * 3.5,
    OH: Number.MIN_SAFE_INTEGER,
  },
  FURY: {
    // From SimulationCraft
    MH: Number(BASE_RAGE_GENERATION),
    // Off-hand is half of main-hand
    OH: Number(BASE_RAGE_GENERATION) * 0.5,
  },
  PROTECTION: {
    // From SimulationCraft
    MH: BASE_RAGE_GENERATION * 0.44,
    OH: Number.MIN_SAFE_INTEGER,
  },
} as const);

const DEFAULT_SPEED_2H = 3.6;
const DEFAULT_SPEED_1H = 2.6;

/**
 * Goes through all events, and inserts `ResourceChangeEvent`s for rage generation
 * for auto attacks.
 */
export default class GenerateRageEventsNormalizer extends EventsNormalizer {
  static dependencies = {
    ...EventsNormalizer.dependencies,
    WindfuryLinkNormalizer,
  };

  normalize(events: AnyEvent[]): AnyEvent[] {
    const updatedEvents: AnyEvent[] = [];

    const recklessnessIncrease =
      this.selectedCombatant.hasTalent(TALENTS.RECKLESSNESS_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.BERSERKERS_TORMENT_TALENT)
        ? RECKLESSNESS_INCREASE
        : WARLORDS_TORMENT_RECKLESSNESS_INCREASE;

    /** How much rage each swing generates, without any buffs or effects */
    let rawRagePerSwingMH = Number.MIN_SAFE_INTEGER;
    /** How much rage each swing generates, without any buffs or effects */
    let rawRagePerSwingOH = Number.MIN_SAFE_INTEGER;
    /** How much rage each swing generates, with permanent effects, but no buffs */
    let unbuffedRagePerSwingMH = Number.MIN_SAFE_INTEGER;
    /** How much rage each swing generates, with permanent effects, but no buffs */
    let unbuffedRagePerSwingOH = Number.MIN_SAFE_INTEGER;

    switch (this.selectedCombatant.spec?.id) {
      case SPECS.ARMS_WARRIOR.id: {
        rawRagePerSwingMH = this.calculateRawRagePerSwing(
          AUTO_ATTACK_RAGE_PS.ARMS.MH,
          DEFAULT_SPEED_2H,
        );
        unbuffedRagePerSwingMH = this.calculateUnbuffedRagePerSwing(rawRagePerSwingMH);
        break;
      }
      case SPECS.FURY_WARRIOR.id: {
        // While it would be nice to look at the speed or slot for weapons, I don't know if that's possible
        // so we'll just make the assumption that they have specced correctly if they are using 1h weapons
        // We also assume you have 2x2h or 2x1h, no mix and match
        const speed = this.selectedCombatant.hasTalent(TALENTS.SINGLE_MINDED_FURY_TALENT)
          ? DEFAULT_SPEED_1H
          : DEFAULT_SPEED_2H;

        rawRagePerSwingMH = this.calculateRawRagePerSwing(AUTO_ATTACK_RAGE_PS.FURY.MH, speed);
        rawRagePerSwingOH = this.calculateRawRagePerSwing(AUTO_ATTACK_RAGE_PS.FURY.OH, speed);
        unbuffedRagePerSwingMH = this.calculateUnbuffedRagePerSwing(rawRagePerSwingMH);
        unbuffedRagePerSwingOH = this.calculateUnbuffedRagePerSwing(rawRagePerSwingOH);
        break;
      }
      case SPECS.PROTECTION_WARRIOR.id:
      default: {
        rawRagePerSwingMH = this.calculateRawRagePerSwing(
          AUTO_ATTACK_RAGE_PS.PROTECTION.MH,
          DEFAULT_SPEED_1H,
        );
        unbuffedRagePerSwingMH = this.calculateUnbuffedRagePerSwing(rawRagePerSwingMH);
        break;
      }
    }

    /** `true` if next swing _should_ be with offhand */
    let lastHitWasOffHand = true;
    // While it would be nice to adjust for overwhelming rage, we can't check combatant talents in normalizer
    let maxRage = 100 / RAGE_SCALE_FACTOR;
    let lastRageCount = 0;
    let recklessnessBuff = false;

    events.forEach((event) => {
      let ragePerSwingMH = unbuffedRagePerSwingMH;
      let ragePerSwingOH = unbuffedRagePerSwingOH;

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

      if (recklessnessBuff) {
        ragePerSwingMH = Math.ceil(ragePerSwingMH * (1 + recklessnessIncrease));
        ragePerSwingOH = Math.ceil(ragePerSwingOH * (1 + recklessnessIncrease));
      }

      const rage = getRage(event, this.selectedCombatant);

      if (
        event.type === EventType.Cast &&
        event.ability.guid === SPELLS.MELEE.id &&
        event.sourceID === this.selectedCombatant.id
      ) {
        const generated = rage == null ? 0 : Math.max(rage?.amount - lastRageCount, 0);
        if (rage != null) {
          maxRage = rage.max;
        }
        const isMax = Math.ceil(rage ? rage.amount : lastRageCount) === Math.ceil(maxRage);

        const extraAttack = getWindfuryFromTriggered(event);

        const isOffHand = (() => {
          if (this.selectedCombatant.spec?.id !== SPECS.FURY_WARRIOR.id) {
            return false;
          }

          if (extraAttack) {
            // If it is windfury attack, look at spell id
            return extraAttack.ability.guid === SPELLS.WINDFURY_EXTRA_ATTACK_OH.id;
          } else {
            // if it is not a windfury attack.

            const windfuryProc = getWindfuryFromTrigger(event);
            if (windfuryProc != null) {
              // If this attack triggered a windfury proc, we can look at the id of the proc
              return windfuryProc.ability.guid === SPELLS.WINDFURY_EXTRA_ATTACK_OH.id;
            }

            if (!isMax && generated > 0) {
              // As long as we are not capped, and didn't miss,
              // we can look at the rage generated to figure out if it was offhand
              // We use the average as a threshold, to allow some variance
              return generated < (ragePerSwingMH + ragePerSwingOH) / 2;
            }

            // If it did not proc windfury, and we are capped or missed, we can't tell
            // so we assume alternating swings
            return !lastHitWasOffHand;
          }
        })();

        const expectedGeneration = isOffHand ? ragePerSwingOH : ragePerSwingMH;

        // If we're not at max, we have not wasted even if expectedGeneration mismatches
        let rageWasted = isMax ? expectedGeneration - generated : 0;

        if (rageWasted < 0) {
          console.error(
            'Rage wasted is negative. This means generated rage is higher than expected',
            {
              expectedGeneration,
              generated,
            },
          );
          // Best we can do is pretend like there was 0 waste
          rageWasted = 0;
        }

        if ((isMax ? expectedGeneration : generated) % 1 !== 0) {
          console.error('Rage generation is not an integer');
        }

        if (extraAttack) {
          const newEvents = this.generateResourceChanges({
            event: event,
            resourceChange: isMax ? expectedGeneration : generated,
            waste: rageWasted,
            ability: {
              type: MAGIC_SCHOOLS.ids.PHYSICAL,
              name: SPELLS.SKYFURY.name,
              abilityIcon: SPELLS.SKYFURY.icon,
              guid: SPELLS.SKYFURY.id,
            },
          });

          updatedEvents.push(...newEvents);
        } else {
          const newEvents = this.generateResourceChanges({
            event: event,
            resourceChange: isMax ? expectedGeneration : generated,
            waste: rageWasted,
          });

          updatedEvents.push(...newEvents);

          // If it was a non-windfury hit, we track last hit
          lastHitWasOffHand = isOffHand;
        }
      } else if (
        event.type === EventType.Damage &&
        event.sourceID === this.selectedCombatant.id &&
        event.ability.guid === SPELLS.MELEE.id
      ) {
        if (
          this.selectedCombatant.spec?.id === SPECS.ARMS_WARRIOR.id &&
          event.hitType === HIT_TYPES.CRIT
        ) {
          // Handle Seasoned Soldier
          // const castEvent = meleeCastEvent(event);
          // const rageEvent = rageEventFromCast(castEvent);

          // We don't account for Recklessness, because the CastEvent resouceChange is accounting for it
          // ACTUALLY seasoned soldier is unaffected by recklessness, so we can't even use the source event*
          const seasonedSoldierResourceChange = rawRagePerSwingMH * SEASONED_SOLDIER_RAGE_INCREASE;
          const newRageCount = Math.min(
            Math.round(lastRageCount + seasonedSoldierResourceChange),
            maxRage,
          );
          const seasonedSoldierWaste =
            seasonedSoldierResourceChange - Math.round(newRageCount - lastRageCount);

          if (seasonedSoldierWaste < 0) {
            throw new Error('Seasoned Soldier waste is negative');
          }

          const newEvent = this.resourceChangeEvent(event, {
            resourceChange: Math.round(seasonedSoldierResourceChange),
            waste: Math.round(seasonedSoldierWaste),
            ability: {
              type: MAGIC_SCHOOLS.ids.PHYSICAL,
              name: SPELLS.SEASONED_SOLDIER.name,
              abilityIcon: SPELLS.SEASONED_SOLDIER.icon,
              guid: SPELLS.SEASONED_SOLDIER.id,
            },
            classResources: [
              {
                type: RESOURCE_TYPES.RAGE.id,
                max: maxRage,
                amount: newRageCount,
              },
            ],
          });

          updatedEvents.push(newEvent);

          lastRageCount = newRageCount;
        }
      }

      if (rage) {
        // Whatever the event, if it tells us the current rage, that helps us figure out
        // auto attack rage
        lastRageCount =
          rage.amount -
          // We already know cost will be subtracted, so we can adjust for that
          (rage.cost ?? 0);
        maxRage = rage.max;
      }

      // Add this event no matter what
      updatedEvents.push(event);
    });
    return updatedEvents;
  }

  private calculateRawRagePerSwing(ragePerSecond: number, speed: number) {
    return Math.ceil((ragePerSecond * speed) / RAGE_SCALE_FACTOR);
  }

  private calculateUnbuffedRagePerSwing(rawRagePerSwing: number) {
    let unbuffedRagePerSwing = rawRagePerSwing;

    if (this.selectedCombatant.hasTalent(TALENTS.WAR_MACHINE_FURY_TALENT)) {
      unbuffedRagePerSwing += unbuffedRagePerSwing * WARMACHINE_FURY_INCREASE;
    } else if (this.selectedCombatant.hasTalent(TALENTS.WAR_MACHINE_ARMS_TALENT)) {
      unbuffedRagePerSwing += unbuffedRagePerSwing * WARMACHINE_ARMS_INCREASE;
    } else if (this.selectedCombatant.hasTalent(TALENTS.WAR_MACHINE_PROTECTION_TALENT)) {
      unbuffedRagePerSwing += unbuffedRagePerSwing * WARMACHINE_PROT_INCREASE;
    }

    return Math.ceil(unbuffedRagePerSwing);
  }

  private generateResourceChanges = ({
    event,
    resourceChange,
    waste,
    ability,
  }: {
    event: CastEvent;
    resourceChange: number;
    waste: number;
    ability?: ResourceChangeEvent['ability'];
  }): ResourceChangeEvent[] => {
    const response: ResourceChangeEvent[] = [];

    const eventRage = getRage(event, this.selectedCombatant);
    if (eventRage == null) {
      throw new Error('Event should have rage');
    }
    const meleeResourceChange = this.resourceChangeEvent(event, {
      resourceChange,
      waste,
      ...(ability
        ? {
            ability,
          }
        : {}),
      classResources: [
        {
          type: RESOURCE_TYPES.RAGE.id,
          max: eventRage.max,
          amount: eventRage.amount,
        },
      ],
    });
    response.push(meleeResourceChange);

    // Link the original cast with the generated resource change
    AddRelatedEvent(event, RAGE_RELATION, meleeResourceChange);

    return response;
  };

  private resourceChangeEvent(
    event: CastEvent | DamageEvent,
    modifications: Partial<ResourceChangeEvent>,
  ): ResourceChangeEvent {
    return {
      __fabricated: true,
      type: EventType.ResourceChange,
      ability: event.ability,
      sourceID: this.selectedCombatant.id,
      sourceIsFriendly: true,
      targetID: this.selectedCombatant.id,
      targetIsFriendly: true,
      resourceChangeType: RESOURCE_TYPES.RAGE.id,
      otherResourceChange: 0,
      resourceActor: ResourceActor.Source,
      // We ignore existing classResources, because we don't know original resourceActor
      classResources: [],
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
      timestamp: event.timestamp,
      resourceChange: 0,
      waste: 0,

      ...modifications,
    };
  }
}
