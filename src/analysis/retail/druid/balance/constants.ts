import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import Combatant from 'parser/core/Combatant';
import { TALENTS_DRUID } from 'common/TALENTS';

/** Returns the Balance Druid's primary cooldown spell, which changes based on talent */
export function cdSpell(c: Combatant): Spell {
  const hasIncarn = c.hasTalent(TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_TALENT);
  const hasOs = c.hasTalent(TALENTS_DRUID.ORBITAL_STRIKE_TALENT);
  return hasIncarn
    ? hasOs
      ? SPELLS.INCARNATION_ORBITAL_STRIKE
      : SPELLS.INCARNATION_CHOSEN_OF_ELUNE
    : hasOs
      ? SPELLS.CELESTIAL_ALIGNMENT_ORBITAL_STRIKE
      : SPELLS.CELESTIAL_ALIGNMENT;
}

const CA_DURATION = 15_000;
const INCARN_DURATION = 20_000;
/** Returns the duration of Balance Druid's primary cooldown spell */
export function cdDuration(c: Combatant): number {
  return c.hasTalent(TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_TALENT)
    ? INCARN_DURATION
    : CA_DURATION;
}

const BASE_CD = 180;
const WHIRLING_STARS_CD_REDUCTION = 60;
const ORBITAL_STRIKE_CD_REDUCTION = 60;
/** Returns the cooldown of Balance Druid's primary cooldown spell, which changes based on talent */
export function cdCooldown(c: Combatant): number {
  // Both CA and INCARN have same base CD of 180s
  return (
    BASE_CD -
    (c.hasTalent(TALENTS_DRUID.WHIRLING_STARS_TALENT) ? WHIRLING_STARS_CD_REDUCTION : 0) -
    (c.hasTalent(TALENTS_DRUID.ORBITAL_STRIKE_TALENT) ? ORBITAL_STRIKE_CD_REDUCTION : 0)
  );
}

/** Helper for checking if player has solar eclipse */
export function hasSolar(c: Combatant): boolean {
  return c.hasBuff(SPELLS.ECLIPSE_SOLAR.id);
}

/** Helper for checking if player has lunar eclipse */
export function hasLunar(c: Combatant): boolean {
  return c.hasBuff(SPELLS.ECLIPSE_LUNAR.id);
}

/** Helper for figuring out the current eclipse state */
export function currentEclipse(c: Combatant): 'none' | 'solar' | 'lunar' | 'both' {
  const solar = hasSolar(c);
  const lunar = hasLunar(c);
  if (solar && lunar) {
    return 'both';
  } else if (solar) {
    return 'solar';
  } else if (lunar) {
    return 'lunar';
  } else {
    return 'none';
  }
}

export const GUIDE_CORE_EXPLANATION_PERCENT = 40;
export const STARSURGE_BASE_COST = 40;
export const STARFALL_BASE_COST = 50;
export const ASTRAL_POWER_SCALE_FACTOR = 0.1; // in events all values are x10
