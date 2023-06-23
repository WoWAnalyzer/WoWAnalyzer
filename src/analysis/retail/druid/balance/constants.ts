import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import Combatant from 'parser/core/Combatant';
import { TALENTS_DRUID } from 'common/TALENTS';

export const WHITELIST_ABILITIES = [
  SPELLS.STARSURGE_MOONKIN,
  SPELLS.STARSURGE_AFFINITY,
  SPELLS.STARFIRE,
  SPELLS.WRATH_MOONKIN,
  SPELLS.WRATH,
  SPELLS.SUNFIRE_CAST,
  SPELLS.MOONFIRE_CAST,
  SPELLS.STARFALL_CAST,
  SPELLS.FULL_MOON,
  SPELLS.HALF_MOON,
  SPELLS.WILD_MUSHROOM,
  SPELLS.CRASHING_STAR,
  SPELLS.ORBITAL_STRIKE,
];

// Celestial Alignment or Incarnation buff
export const CA_BUFF = [SPELLS.CELESTIAL_ALIGNMENT, SPELLS.INCARNATION_CHOSEN_OF_ELUNE];

// Need to fix this for DF -> you might take neither CA nor Incarn
export function cooldownAbility(combatant: Combatant): Spell {
  return combatant.hasTalent(TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_TALENT)
    ? TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_TALENT
    : SPELLS.CELESTIAL_ALIGNMENT;
}

export const GUIDE_CORE_EXPLANATION_PERCENT = 40;
export const STARSURGE_ELUNES_GUIDANCE_DISCOUNT = 8;
export const STARFALL_ELUNES_GUIDANCE_DISCOUNT = 10;
export const STARSURGE_BASE_COST = 40;
export const STARFALL_BASE_COST = 50;
export const ASTRAL_POWER_SCALE_FACTOR = 0.1; // in events all values are x10
