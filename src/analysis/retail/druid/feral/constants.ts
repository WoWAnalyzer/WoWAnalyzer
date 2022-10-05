import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import Spell from 'common/SPELLS/Spell';
import Combatant from 'parser/core/Combatant';

/** The cast spells for Combo Point generating abilities */
export const CP_GENERATORS: Spell[] = [
  SPELLS.SHRED,
  SPELLS.RAKE,
  SPELLS.THRASH_FERAL,
  SPELLS.SWIPE_CAT,
  SPELLS.MOONFIRE_FERAL,
  TALENTS_DRUID.BRUTAL_SLASH_TALENT,
  TALENTS_DRUID.FERAL_FRENZY_TALENT,
];

/** The cast spells for Finishers */
export const FINISHERS: Spell[] = [
  SPELLS.FEROCIOUS_BITE,
  SPELLS.RIP,
  SPELLS.MAIM,
  TALENTS_DRUID.PRIMAL_WRATH_TALENT,
];

export const MAX_CPS = 5;

export const RAKE_BASE_DURATION = 15000;
export const RIP_DURATION_1_CP = 8000; // TODO remove
export const RIP_DURATION_BASE = 4000;
export const RIP_DURATION_PER_CP = 4000;
export const PRIMAL_WRATH_RIP_DURATION_BASE = 2000;
export const PRIMAL_WRATH_RIP_DURATION_PER_CP = 2000;
export const RIP_MAXIMUM_EXTENDED_DURATION = 31200;
export const SABERTOOTH_EXTEND_PER_CP = 1000;
// cat moonfire lasts for 14 seconds, unlike caster and bear moonfire with a base of 16 seconds.
export const MOONFIRE_FERAL_BASE_DURATION = 14000;
export const THRASH_FERAL_BASE_DURATION = 15000;

export const SAVAGE_ROAR_DAMAGE_BONUS = 0.15;
export const TIGERS_FURY_DAMAGE_BONUS = 0.15;
export const BLOODTALONS_DAMAGE_BONUS = 0.3;
export const MOMENT_OF_CLARITY_DAMAGE_BONUS = 0.15;
export const PROWL_RAKE_DAMAGE_BONUS = 0.6;

export const PANDEMIC_FRACTION = 0.3;

// TODO still correct?
export const BERSERK_ENERGY_COST_MULTIPLIER = 0.6;

export const ENERGY_FOR_FULL_DAMAGE_BITE = 50;
export const MAX_BITE_DAMAGE_BONUS_FROM_ENERGY = 1.0;

// TODO are these still relevant?
export const SHRED_COEFFICIENT = 0.380562;
export const SWIPE_CAT_COEFFICIENT = 0.25;
export const SWIPE_BEAR_COEFFICIENT = 0.3;
export const BRUTAL_SLASH_COEFFICIENT = 0.6;

// TODO are these still relevant?
export const FERAL_DRUID_DAMAGE_AURA = 1.12;
export const INCARNATION_SHRED_DAMAGE = 1.5;
export const SHRED_SWIPE_BONUS_ON_BLEEDING = 1.2;

/** Returns the Feral Druid's primary cooldown spell, which changes based on talent */
export function cdSpell(c: Combatant): Spell {
  return c.hasTalent(TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT)
    ? TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT
    : SPELLS.BERSERK;
}

/** Returns the Feral Druid's direct damage AoE builder, which changes based on talent */
export function directAoeBuilder(c: Combatant): Spell {
  return c.hasTalent(TALENTS_DRUID.BRUTAL_SLASH_TALENT)
    ? TALENTS_DRUID.BRUTAL_SLASH_TALENT
    : SPELLS.SWIPE_CAT;
}
