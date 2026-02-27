import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import Combatant from 'parser/core/Combatant';

const defaultDurations = {
  // Baseline spells
  [SPELLS.AGONY.id]: 18000,
  [SPELLS.CORRUPTION_DEBUFF.id]: 14000,
  // Talents
  [TALENTS.UNSTABLE_AFFLICTION_TALENT.id]: 8000,
} as const;

const affectedByCreepingDeath = [
  SPELLS.AGONY.id,
  SPELLS.CORRUPTION_DEBUFF.id,
  TALENTS.SIPHON_LIFE_TALENT.id,
  TALENTS.UNSTABLE_AFFLICTION_TALENT.id,
] as const;

export const getDotDurations = (combatant: Combatant): Record<number, number> =>
  combatant.hasTalent(TALENTS.CREEPING_DEATH_TALENT)
    ? Object.fromEntries(
        Object.entries(defaultDurations).map(([key, value]) => [
          key,
          value * (affectedByCreepingDeath.includes(parseInt(key)) ? 0.85 : 1),
        ]),
      )
    : defaultDurations;

// Corruption Talent Modifiers
export const SL_DAMAGE_BONUS = 0.2;
export const AC_DAMAGE_BONUS = 0.15;
