import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import Spell from 'common/SPELLS/Spell';
import Combatant from 'parser/core/Combatant';
import { CastEvent, DamageEvent } from 'parser/core/Events';
import getResourceSpent from 'parser/core/getResourceSpent';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { getHardcast } from 'analysis/retail/druid/feral/normalizers/CastLinkNormalizer';

/** Feral combo point cap */
export const MAX_CPS = 5;

///////////////////////////////////////////////////////////////////////////////
// SPELL CATEGORIES
//

/** The cast / energize spells for Combo Point generating abilities */
export const CP_GENERATORS: Spell[] = [
  SPELLS.SHRED,
  SPELLS.RAKE,
  SPELLS.THRASH_FERAL,
  SPELLS.SWIPE_CAT,
  SPELLS.MOONFIRE_FERAL,
  TALENTS_DRUID.BRUTAL_SLASH_TALENT,
  TALENTS_DRUID.FERAL_FRENZY_TALENT, // the cast ID
  SPELLS.FERAL_FRENZY_DEBUFF, // the resource generate ID
];

/** The cast spells for Finishers */
export const FINISHERS: Spell[] = [
  SPELLS.FEROCIOUS_BITE,
  SPELLS.RAVAGE_DOTC_CAT,
  SPELLS.RIP,
  SPELLS.MAIM,
  TALENTS_DRUID.PRIMAL_WRATH_TALENT,
];
export const FINISHER_IDS: number[] = FINISHERS.map((s) => s.id);

/** Druid of the Claw's 'Ravage' conditionally replaces Ferocious Bite.
 * These spells are for the cast, damage, and extra energy drain. */
export const FB_SPELLS: Spell[] = [SPELLS.FEROCIOUS_BITE, SPELLS.RAVAGE_DOTC_CAT];

export const FB_IDS: number[] = FB_SPELLS.map((s) => s.id);

/** Spells that have their damage boosted by Tiger's Fury */
export const TIGERS_FURY_BOOSTED: Spell[] = [
  SPELLS.SHRED,
  SPELLS.FEROCIOUS_BITE,
  SPELLS.RAVAGE_DOTC_CAT,
  SPELLS.DREADFUL_WOUND,
  SPELLS.THRASH_FERAL,
  SPELLS.THRASH_FERAL_BLEED,
  SPELLS.RIP,
  SPELLS.RAKE,
  SPELLS.RAKE_BLEED,
  SPELLS.MAIM,
  TALENTS_DRUID.BRUTAL_SLASH_TALENT,
  TALENTS_DRUID.PRIMAL_WRATH_TALENT,
  SPELLS.SWIPE_CAT,
  SPELLS.MOONFIRE_FERAL,
  TALENTS_DRUID.FERAL_FRENZY_TALENT,
  SPELLS.FERAL_FRENZY_DEBUFF,
  SPELLS.FRENZIED_ASSAULT,
  SPELLS.TEAR,
  SPELLS.RAMPANT_FEROCITY,
  SPELLS.ADAPTIVE_SWARM_DAMAGE,
  SPELLS.BLOODSEEKER_VINES,
  SPELLS.BURSTING_GROWTH_DAMAGE,
];

export const SABERTOOTH_BOOSTED: Spell[] = [
  SPELLS.THRASH_FERAL,
  SPELLS.THRASH_FERAL_BLEED,
  SPELLS.RIP,
  SPELLS.TEAR,
  SPELLS.RAKE,
  SPELLS.RAKE_BLEED,
  TALENTS_DRUID.FERAL_FRENZY_TALENT,
  SPELLS.FERAL_FRENZY_DEBUFF,
  SPELLS.MOONFIRE_DEBUFF,
  SPELLS.MOONFIRE_FERAL,
  SPELLS.SUNFIRE, // lmao
  SPELLS.ADAPTIVE_SWARM_DAMAGE,
];

///////////////////////////////////////////////////////////////////////////////
// ENERGY STUFF
//

/** Multiplier to energy costs from having Incarnation: Avatar of Ashamane active */
export const INCARN_ENERGY_MULT = 0.75;

/** Shred's energy cost (before modifiers) */
export const SHRED_ENERGY = 40;
/** Thrash's energy cost (before modifiers) */
export const THRASH_ENERGY = 40;
/** Swipe's energy cost (before modifiers) */
export const SWIPE_ENERGY = 35;
/** Brutal Slash's energy cost (before modifiers) */
export const BRUTAL_SLASH_ENERGY = 25;
/** Ferocious Bite's energy cost (before modifiers) */
export const FEROCIOUS_BITE_ENERGY = 25;
/** Ferocious Bite's maximum additional energy drain (before modifiers) */
export const FEROCIOUS_BITE_MAX_DRAIN = 25;

///////////////////////////////////////////////////////////////////////////////
// DOT DURATIONS
//

const CIRCLE_DOT_DURATION_MULT = 0.8;
/** Gets the multiplier to apply to a DoT's duration depending on if player is using
 *  the 'Circle of Life and Death' talent */
function getCircleMult(c: Combatant): number {
  return c.hasTalent(TALENTS_DRUID.CIRCLE_OF_LIFE_AND_DEATH_FERAL_TALENT)
    ? CIRCLE_DOT_DURATION_MULT
    : 1;
}

const VEINRIPPER_DURATION_MULT = 1.25;
/** Gets the multiplier to apply to Rip / Rake / Thrash's duration depending on if player is using
 *  the 'Veinripper' talent */
function getVeinripperMult(c: Combatant): number {
  return c.hasTalent(TALENTS_DRUID.VEINRIPPER_TALENT) ? VEINRIPPER_DURATION_MULT : 1;
}

const RAKE_BASE_DURATION = 15000;
export function getRakeDuration(c: Combatant): number {
  return RAKE_BASE_DURATION * getCircleMult(c) * getVeinripperMult(c);
}

const MOONFIRE_BASE_DURATION = 16000;
export function getMoonfireDuration(c: Combatant): number {
  return MOONFIRE_BASE_DURATION * getCircleMult(c);
}

const THRASH_FERAL_BASE_DURATION = 15000;
export function getThrashFeralDuration(c: Combatant): number {
  return THRASH_FERAL_BASE_DURATION * getCircleMult(c) * getVeinripperMult(c);
}

export const RIP_DURATION_BASE = 4000;
const RIP_DURATION_PER_CP = 4000;
export function getRipDuration(cast: CastEvent, c: Combatant): number {
  return (
    (RIP_DURATION_BASE +
      getResourceSpent(cast, RESOURCE_TYPES.COMBO_POINTS) * RIP_DURATION_PER_CP) *
    getCircleMult(c) *
    getVeinripperMult(c)
  );
}

const PRIMAL_WRATH_RIP_DURATION_BASE = 2000;
const PRIMAL_WRATH_RIP_DURATION_PER_CP = 2000;
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

export const BASE_TIGERS_FURY_DAMAGE_BONUS = 0.15;
const CARNIVOROUS_INSTINCT_DAMAGE_BONUS = 0.06;
export function getTigersFuryDamageBonus(c: Combatant): number {
  return (
    BASE_TIGERS_FURY_DAMAGE_BONUS +
    c.getTalentRank(TALENTS_DRUID.CARNIVOROUS_INSTINCT_TALENT) * CARNIVOROUS_INSTINCT_DAMAGE_BONUS
  );
}

export const BLOODTALONS_DAMAGE_BONUS = 0.25;
export const LIONS_STRENGTH_DAMAGE_BONUS = 0.15;
export const PROWL_RAKE_DAMAGE_BONUS = 0.6;

/** Max time left on a DoT for us to not yell if snapshot is downgraded */
export const SNAPSHOT_DOWNGRADE_BUFFER = 2000;

/** Max time a DoT's duration can be clipped before we yell */
export const CLIP_BUFFER = 2000;

export const PANDEMIC_FRACTION = 0.3;

///////////////////////////////////////////////////////////////////////////////
// TALENT SPELLS
//

/** Returns the Feral Druid's primary cooldown spell, which changes based on talent */
export function cdSpell(c: Combatant): Spell {
  return c.hasTalent(TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT)
    ? TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT
    : SPELLS.BERSERK_CAT;
}

///////////////////////////////////////////////////////////////////////////////
// MISC
//

/** Minimum acceptable number of CPs to use with a finisher (currently always 5, leaving as function in case this changes again) */
export function getAcceptableCps(_: Combatant): number {
  return ACCEPTABLE_CPS;
}
export const ACCEPTABLE_CPS = 5;

/** Effective combo points used by a Convoke'd Ferocious Bite */
export const CONVOKE_FB_CPS = 5;

/** Gets the effective number of CPs that were used to produce this Bite.
 *  Takes DamageEvent instead of CastEvent to also catch Convoke'd bites */
export function getBiteCps(event: DamageEvent) {
  const hardcast = getHardcast(event);
  if (hardcast) {
    const cpsUsed = getResourceSpent(hardcast, RESOURCE_TYPES.COMBO_POINTS);
    // only way to get 0 CPs used is an Apex bite, which counts as though 5 CPs were used
    return cpsUsed === 0 ? MAX_CPS : cpsUsed;
  } else {
    // no hardcast -> from Convoke
    return CONVOKE_FB_CPS;
  }
}

/** Gets the maximum amount of extra energy Ferocious Bite will drain to increase damage.
 *  This value will vary based on if Incarn is up, so call each time you need the number! */
export function getFerociousBiteMaxDrain(c: Combatant) {
  return (
    FEROCIOUS_BITE_MAX_DRAIN *
    (c.hasBuff(TALENTS_DRUID.INCARNATION_AVATAR_OF_ASHAMANE_TALENT.id) ? INCARN_ENERGY_MULT : 1)
  );
}

const TIGERS_FURY_BASE_DURATION = 10_000;
const PREDATOR_DURATION_BOOST = 5_000;
const RAGING_FURY_DURATION_BOOST = 5_000;

export function getTigersFuryDuration(c: Combatant) {
  return (
    TIGERS_FURY_BASE_DURATION +
    c.getTalentRank(TALENTS_DRUID.PREDATOR_TALENT) * PREDATOR_DURATION_BOOST +
    c.getTalentRank(TALENTS_DRUID.RAGING_FURY_TALENT) * RAGING_FURY_DURATION_BOOST
  );
}
