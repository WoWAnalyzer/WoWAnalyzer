import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import Combatant from 'parser/core/Combatant';
import { HealEvent } from 'parser/core/Events';
import { healingIncreases } from '../../restoration/constants';

export type EarthShieldBucket = 'earthShield' | 'elementalOrbit';

export interface EarthShieldHealSplit {
  /** Which shield the heal came from: the one on an ally, or the shaman's own. */
  bucket: EarthShieldBucket;
  /** Effective healing the shield would have done without any of the talents below. */
  base: number;
  earthweaver: number;
  therazanesResilience: number;
  earthenCommunion: number;
  earthenHarmony: number;
}

type TalentKey = Exclude<keyof EarthShieldHealSplit, 'bucket' | 'base'>;

/**
 * Earthen Harmony increases Earth Shield healing by up to 150%, scaling linearly with the
 * target's missing health and reaching the maximum at or below 50% health.
 * Uses the target's health before this heal landed.
 */
export function earthenHarmonyIncrease(event: HealEvent): number {
  const healthBefore = (event.hitPoints - event.amount) / event.maxHitPoints;
  const scaling = Math.min(1, Math.max(0, (1 - healthBefore) / 0.5));
  return healingIncreases.EARTHEN_HARMONY_HEALING_INCREASE * scaling;
}

/**
 * Splits one Earth Shield heal into the part each talent added, so all parts add up to exactly
 * the effective heal.
 *
 * As in `calculateEffectiveHealing`, overheal is taken from the talents' part first.
 *
 * @returns null when the target has no Earth Shield from the caster.
 */
export function splitEarthShieldHeal(
  event: HealEvent,
  caster: Combatant,
  target: Combatant,
): EarthShieldHealSplit | null {
  let bucket: EarthShieldBucket;
  if (
    target.hasBuff(SPELLS.EARTH_SHIELD_ELEMENTAL_ORBIT_BUFF.id, event.timestamp, 0, 0, caster.id)
  ) {
    bucket = 'elementalOrbit';
  } else if (target.hasBuff(TALENTS.EARTH_SHIELD_TALENT.id, event.timestamp, 0, 0, caster.id)) {
    bucket = 'earthShield';
  } else {
    return null;
  }

  const increases: Record<TalentKey, number> = {
    earthweaver: caster.hasTalent(TALENTS.EARTHWEAVER_TALENT)
      ? healingIncreases.EARTHWEAVER_HEALING_INCREASE
      : 0,
    therazanesResilience: caster.hasTalent(TALENTS.THERAZANES_RESILIENCE_TALENT)
      ? healingIncreases.THERAZANES_RESILIENCE_HEALING_INCREASE
      : 0,
    // Only on the player's own shield.
    earthenCommunion:
      caster.hasTalent(TALENTS.EARTHEN_COMMUNION_TALENT) && event.targetID === caster.id
        ? healingIncreases.EARTHEN_COMMUNION_HEALING_INCREASE
        : 0,
    earthenHarmony: caster.hasTalent(TALENTS.EARTHEN_HARMONY_TALENT)
      ? earthenHarmonyIncrease(event)
      : 0,
  };

  const effective = event.amount + (event.absorbed || 0);
  const overheal = event.overheal || 0;
  const raw = effective + overheal;
  const weights = Object.fromEntries(
    Object.entries(increases).map(([key, increase]) => [key, Math.log(1 + increase)]),
  ) as Record<TalentKey, number>;
  const weightSum = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

  // exp(weightSum) is the product of all (1 + increase), so raw / exp(weightSum) is the heal
  // without any of the talents, and rawBonus is what they added together.
  const rawBonus = raw - raw / Math.exp(weightSum);
  const effectiveBonus = Math.max(0, rawBonus - overheal);
  const shareOf = (key: TalentKey) =>
    weightSum > 0 ? (effectiveBonus * weights[key]) / weightSum : 0;

  return {
    bucket,
    base: effective - effectiveBonus,
    earthweaver: shareOf('earthweaver'),
    therazanesResilience: shareOf('therazanesResilience'),
    earthenCommunion: shareOf('earthenCommunion'),
    earthenHarmony: shareOf('earthenHarmony'),
  };
}
