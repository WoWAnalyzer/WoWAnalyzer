import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import Spell from 'common/SPELLS/Spell';
import Combatant from 'parser/core/Combatant';
import { CastEvent } from 'parser/core/Events';
import getResourceSpent from 'parser/core/getResourceSpent';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

/** Feral combo point cap */
export const MAX_CPS = 5;

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

///////////////////////////////////////////////////////////////////////////////
// DOT DURATIONS
//

export const CIRCLE_DOT_DURATION_MULT = 0.75;
/** Gets the multiplier to apply to a DoT's duration depending on if player is using
 *  the 'Circle of Life and Death' talent */
function getCircleMult(c: Combatant): number {
  return c.hasTalent(TALENTS_DRUID.CIRCLE_OF_LIFE_AND_DEATH_TALENT) ? CIRCLE_DOT_DURATION_MULT : 1;
}

export const VEINRIPPER_DURATION_MULT = 1.25;
/** Gets the multiplier to apply to Rip / Rake / Thrash's duration depending on if player is using
 *  the 'Veinripper' talent */
function getVeinripperMult(c: Combatant): number {
  return c.hasTalent(TALENTS_DRUID.VEINRIPPER_TALENT) ? VEINRIPPER_DURATION_MULT : 1;
}

export const RAKE_BASE_DURATION = 15000;
export function getRakeDuration(c: Combatant): number {
  return RAKE_BASE_DURATION * getCircleMult(c) * getVeinripperMult(c);
}

export const MOONFIRE_BASE_DURATION = 16000;
export function getMoonfireDuration(c: Combatant): number {
  return MOONFIRE_BASE_DURATION * getCircleMult(c);
}

export const THRASH_FERAL_BASE_DURATION = 15000;
export function getThrashFeralDuration(c: Combatant): number {
  return THRASH_FERAL_BASE_DURATION * getCircleMult(c) * getVeinripperMult(c);
}

export const RIP_DURATION_BASE = 4000;
export const RIP_DURATION_PER_CP = 4000;
export function getRipDuration(cast: CastEvent, c: Combatant): number {
  return (
    (RIP_DURATION_BASE +
      getResourceSpent(cast, RESOURCE_TYPES.COMBO_POINTS) * RIP_DURATION_PER_CP) *
    getCircleMult(c) *
    getVeinripperMult(c)
  );
}

export const PRIMAL_WRATH_RIP_DURATION_BASE = 2000;
export const PRIMAL_WRATH_RIP_DURATION_PER_CP = 2000;
export function getPrimalWrathDuration(cast: CastEvent, c: Combatant): number {
  return (
    (PRIMAL_WRATH_RIP_DURATION_BASE +
      getResourceSpent(cast, RESOURCE_TYPES.COMBO_POINTS) * PRIMAL_WRATH_RIP_DURATION_PER_CP) *
    getCircleMult(c) *
    getVeinripperMult(c)
  );
}

export function getRipFullDuration(c: Combatant): number {
  return (
    (RIP_DURATION_BASE + RIP_DURATION_PER_CP * MAX_CPS) * getCircleMult(c) * getVeinripperMult(c)
  );
}

///////////////////////////////////////////////////////////////////////////////
// SNAPSHOTS
//

export const TIGERS_FURY_DAMAGE_BONUS = 0.15;
export const BLOODTALONS_DAMAGE_BONUS = 0.3;
export const MOMENT_OF_CLARITY_DAMAGE_BONUS = 0.15;
export const PROWL_RAKE_DAMAGE_BONUS = 0.6;

/** Max time left on a DoT for us to not yell if snapshot is downgraded */
export const SNAPSHOT_DOWNGRADE_BUFFER = 2000;

export const PANDEMIC_FRACTION = 0.3;

///////////////////////////////////////////////////////////////////////////////
// TALENT SPELLS
//

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
