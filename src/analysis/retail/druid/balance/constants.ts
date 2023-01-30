import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import Combatant from 'parser/core/Combatant';
import { TALENTS_DRUID } from 'common/TALENTS';

export const DAMAGING_ABILITIES = [
  SPELLS.STARSURGE_MOONKIN.id,
  SPELLS.STARSURGE_AFFINITY.id,
  SPELLS.STARFIRE.id,
  SPELLS.WRATH_MOONKIN.id,
  SPELLS.WRATH.id,
  SPELLS.SUNFIRE_CAST.id,
  SPELLS.MOONFIRE_CAST.id,
  SPELLS.STARFALL_CAST.id,
  SPELLS.FULL_MOON.id,
  SPELLS.HALF_MOON.id,
];

// Celestial Alignment buff or the talented version of it (Incarnation)
export const CA_BUFF = [SPELLS.CELESTIAL_ALIGNMENT, SPELLS.INCARNATION_CHOSEN_OF_ELUNE];

export function cooldownAbility(combatant: Combatant): Spell {
  return combatant.hasTalent(TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_TALENT)
    ? TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_TALENT
    : SPELLS.CELESTIAL_ALIGNMENT;
}

export const GUIDE_CORE_EXPLANATION_PERCENT = 40;
export const STARSURGE_ELUNES_GUIDANCE_DISCOUNT = 5;
export const STARFALL_ELUNES_GUIDANCE_DISCOUNT = 8;
export const STARSURGE_BASE_COST = 40;
export const STARFALL_BASE_COST = 50;
