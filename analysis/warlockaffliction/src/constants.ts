import SPELLS from 'common/SPELLS';
import Combatant from 'parser/core/Combatant';

const defaultDurations = {
  [SPELLS.AGONY.id]: 18000,
  [SPELLS.CORRUPTION_DEBUFF.id]: 14000,
  [SPELLS.SIPHON_LIFE_TALENT.id]: 15000,
  [SPELLS.UNSTABLE_AFFLICTION.id]: 16000,
  // Talents
  [SPELLS.PHANTOM_SINGULARITY_TALENT.id]: 16000,
  [SPELLS.VILE_TAINT_TALENT.id]: 10000,
  // Covenant dots
  [SPELLS.SCOURING_TITHE.id]: 18000,
  [SPELLS.SOUL_ROT.id]: 8000,
  [SPELLS.IMPENDING_CATASTROPHE_DEBUFF.id]: 12000,
} as const;

const affectedByCreepingDeath = [
  SPELLS.AGONY.id,
  SPELLS.CORRUPTION_DEBUFF.id,
  SPELLS.SIPHON_LIFE_TALENT.id,
  SPELLS.UNSTABLE_AFFLICTION.id,
] as const;

export const getDotDurations = (combatant: Combatant): Record<number, number> =>
  combatant.hasTalent(SPELLS.CREEPING_DEATH_TALENT.id)
    ? Object.fromEntries(
        Object.entries(defaultDurations).map(([key, value]) => [
          key,
          value * (affectedByCreepingDeath.includes(key) ? 0.85 : 1),
        ]),
      )
    : defaultDurations;
