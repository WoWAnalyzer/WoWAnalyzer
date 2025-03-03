import getRage from 'analysis/retail/warrior/shared/utils/getRage';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import HIT_TYPES from 'game/HIT_TYPES';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SPECS from 'game/SPECS';
import { Options } from 'parser/core/Analyzer';
import {
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
  AUTO_ATTACK_RAGE_PS,
  DEFAULT_SPEED_1H,
  DEFAULT_SPEED_2H,
  RAGE_SCALE_FACTOR,
  RECKLESSNESS_INCREASE,
  SEASONED_SOLDIER_RAGE_INCREASE,
  WARLORDS_TORMENT_RECKLESSNESS_INCREASE,
  WARMACHINE_ARMS_INCREASE,
  WARMACHINE_FURY_INCREASE,
  WARMACHINE_PROT_INCREASE,
} from './constants';

/**
 * Synthesizes {@link ResourceChangeEvent}s for melee attacks.
 *
 * Melee attacks generates rage, but does not log it as resource changes.
 * By being trying to be clever, we can figure out how much rage was generated
 * and create {@link ResourceChangeEvent}s for them.
 *
 * Note that this normalizer does not attribute rage to the correct ability,
 * but focuses on the amount of rage generated.
 *
 * Whenever rage is actually generated, we rely on the differance in rage since
 * last event to determine how much rage was generated. When the rage is capped,
 * we want to track how much rage was wasted, and we have to do some complicated
 * guessing.
 */
export default class GenerateRageEventsNormalizer extends EventsNormalizer {
  static dependencies = {
    ...EventsNormalizer.dependencies,
    WindfuryLinkNormalizer,
  };

  /** How much rage each swing generates, without any buffs or effects */
  private rawRagePerSwing = Number.MIN_SAFE_INTEGER;
  /** How much rage each swing generates, with permanent effects, but no buffs */
  private unbuffedRagePerSwing = Number.MIN_SAFE_INTEGER;
  private recklessnessIncrease = Number.MIN_SAFE_INTEGER;

  constructor(options: Options) {
    super(options);

    switch (this.selectedCombatant.spec?.id) {
      case SPECS.ARMS_WARRIOR.id: {
        this.recklessnessIncrease = WARLORDS_TORMENT_RECKLESSNESS_INCREASE;

        this.rawRagePerSwing = this.calculateRawRagePerSwing(
          AUTO_ATTACK_RAGE_PS.ARMS,
          DEFAULT_SPEED_2H,
        );
        this.unbuffedRagePerSwing = this.calculateUnbuffedRagePerSwing(this.rawRagePerSwing);
        break;
      }
      case SPECS.FURY_WARRIOR.id: {
        this.recklessnessIncrease = RECKLESSNESS_INCREASE;

        // While it would be nice to look at the speed or slot for weapons, I don't know if that's possible
        // so we'll just make the assumption that they have specced correctly if they are using 1h weapons
        // We also assume you have 2x2h or 2x1h, no mix and match
        const speed = this.selectedCombatant.hasTalent(TALENTS.SINGLE_MINDED_FURY_TALENT)
          ? DEFAULT_SPEED_1H
          : DEFAULT_SPEED_2H;

        this.rawRagePerSwing = this.calculateRawRagePerSwing(AUTO_ATTACK_RAGE_PS.FURY, speed);
        this.unbuffedRagePerSwing = this.calculateUnbuffedRagePerSwing(this.rawRagePerSwing);
        break;
      }
      case SPECS.PROTECTION_WARRIOR.id:
      default: {
        this.rawRagePerSwing = this.calculateRawRagePerSwing(
          AUTO_ATTACK_RAGE_PS.PROTECTION,
          DEFAULT_SPEED_1H,
        );
        this.unbuffedRagePerSwing = this.calculateUnbuffedRagePerSwing(this.rawRagePerSwing);
        break;
      }
    }
  }

  private recklessnessBuff = false;
  /**
   * Sub-step of `normalize()` which simply updates `this.recklessnessBuff` to
   * reflect if recklessness is currently active or not
   */
  private trackRecklessness(event: AnyEvent): void {
    if (
      HasTarget(event) &&
      event.targetID === this.selectedCombatant.id &&
      event.ability.guid === SPELLS.RECKLESSNESS.id
    ) {
      if (event.type === EventType.ApplyBuff) {
        this.recklessnessBuff = true;
      } else if (event.type === EventType.RemoveBuff) {
        this.recklessnessBuff = false;
      }
    }
  }

  normalize(events: AnyEvent[]): AnyEvent[] {
    /** `true` if next swing _should_ be with offhand */
    let lastHitWasOffHand = true;
    // While it would be nice to adjust for overwhelming rage, we can't check combatant talents in normalizer
    let maxRage = 100 / RAGE_SCALE_FACTOR;
    let lastRageCount = 0;

    const updatedEvents: AnyEvent[] = [];
    for (const event of events) {
      this.trackRecklessness(event);

      let ragePerSwing = this.unbuffedRagePerSwing;

      if (this.recklessnessBuff) {
        ragePerSwing = ragePerSwing * (1 + this.recklessnessIncrease);
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

        let isOffHand = false;
        if (this.selectedCombatant.spec?.id === SPECS.FURY_WARRIOR.id) {
          if (extraAttack) {
            // If it is windfury attack, look at spell id
            isOffHand = extraAttack.ability.guid === SPELLS.WINDFURY_EXTRA_ATTACK_OH.id;
          } else {
            // if it is not a windfury attack.
            const windfuryProc = getWindfuryFromTrigger(event);
            if (windfuryProc != null) {
              // If this attack triggered a windfury proc, we can look at the id of the proc
              isOffHand = windfuryProc.ability.guid === SPELLS.WINDFURY_EXTRA_ATTACK_OH.id;
            } else {
              if (!isMax && generated > 0) {
                // As long as we are not capped, and didn't miss,
                // we can look at the rage generated to figure out if it was offhand
                // Offhand generates half, so if we're closer to that, we assume offhand
                isOffHand = generated < 0.75 * ragePerSwing;
              } else {
                // If it did not proc windfury, and we are capped or missed, we can't tell
                // so we assume alternating swings
                isOffHand = !lastHitWasOffHand;
              }
            }
          }
        }

        const expectedGeneration =
          // If there is no `rage`, it was a miss, and we know it should be 0
          rage == null
            ? 0
            : // Otherwise, we calculate based on the swing
              Math.round(isOffHand ? ragePerSwing / 2 : ragePerSwing);

        // If we're not at max, we have not wasted even if expectedGeneration mismatches
        let rageWasted = isMax ? expectedGeneration - generated : 0;

        if (rageWasted < 0) {
          console.warn(
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
          console.warn('Rage generation is not an integer');
        }

        if (extraAttack) {
          const newEvents = this.generateResourceChanges({
            event: event,
            resourceChange: isMax ? expectedGeneration : generated,
            waste: rageWasted,
            rageAmount: rage?.amount ?? lastRageCount,
            rageMax: rage?.max ?? maxRage,
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
            rageAmount: rage?.amount ?? lastRageCount,
            rageMax: rage?.max ?? maxRage,
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
          // Seasoned Soldier is not affected by Recklessness or other rage modifiers
          // So we can just use the base rage generation
          const seasonedSoldierResourceChange =
            this.rawRagePerSwing * SEASONED_SOLDIER_RAGE_INCREASE;
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
    }
    return updatedEvents;
  }

  private calculateRawRagePerSwing(ragePerSecond: number, speed: number) {
    return (ragePerSecond * speed) / RAGE_SCALE_FACTOR;
  }

  private calculateUnbuffedRagePerSwing(rawRagePerSwing: number) {
    let unbuffedRagePerSwing = rawRagePerSwing;

    if (
      this.selectedCombatant.hasTalent(TALENTS.WAR_MACHINE_TALENT) &&
      this.owner.config.spec.id === SPECS.FURY_WARRIOR.id
    ) {
      unbuffedRagePerSwing += unbuffedRagePerSwing * WARMACHINE_FURY_INCREASE;
    } else if (
      this.selectedCombatant.hasTalent(TALENTS.WAR_MACHINE_TALENT) &&
      this.owner.config.spec.id === SPECS.ARMS_WARRIOR.id
    ) {
      unbuffedRagePerSwing += unbuffedRagePerSwing * WARMACHINE_ARMS_INCREASE;
    } else if (
      this.selectedCombatant.hasTalent(TALENTS.WAR_MACHINE_TALENT) &&
      this.owner.config.spec.id === SPECS.PROTECTION_WARRIOR.id
    ) {
      unbuffedRagePerSwing += unbuffedRagePerSwing * WARMACHINE_PROT_INCREASE;
    }

    return unbuffedRagePerSwing;
  }

  private generateResourceChanges = ({
    event,
    resourceChange,
    waste,
    rageAmount,
    rageMax,
    ability,
  }: {
    event: CastEvent;
    resourceChange: number;
    waste: number;
    rageAmount: number;
    rageMax: number;
    ability?: ResourceChangeEvent['ability'];
  }): ResourceChangeEvent[] => {
    const response: ResourceChangeEvent[] = [];

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
          max: rageMax,
          amount: rageAmount,
        },
      ],
    });
    response.push(meleeResourceChange);

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
      ...(event.type === EventType.Cast
        ? {
            x: event.x!,
            y: event.y!,
            facing: event.facing!,
            mapID: event.mapID!,
          }
        : {
            x: undefined!,
            y: undefined!,
            facing: undefined!,
            mapID: undefined!,
          }),
      itemLevel: event.itemLevel!,
      timestamp: event.timestamp,
      resourceChange: 0,
      waste: 0,

      ...modifications,
    };
  }
}
