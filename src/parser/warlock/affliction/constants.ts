import SPELLS from 'common/SPELLS';
import Combatant from 'parser/core/Combatant';

const defaultDurations = {
  [SPELLS.AGONY.id]: 18000,
  [SPELLS.CORRUPTION_DEBUFF.id]: 14000,
  [SPELLS.SIPHON_LIFE_TALENT.id]: 15000,
  [SPELLS.UNSTABLE_AFFLICTION.id]: 16000,
  [SPELLS.PHANTOM_SINGULARITY_TALENT.id]: 16000,
} as const;

const affectedByCreepingDeath = [
  SPELLS.AGONY.id,
  SPELLS.CORRUPTION_DEBUFF.id,
  SPELLS.SIPHON_LIFE_TALENT.id,
  SPELLS.UNSTABLE_AFFLICTION.id,
] as const;

// TODO Add VT & covenant dots
export const getDotDurations = (combatant: Combatant): Record<number, number> =>
  combatant.hasTalent(SPELLS.CREEPING_DEATH_TALENT.id)
    ? Object.fromEntries(
        Object.entries(defaultDurations).map(([key, value]) => [
          key,
          value * (affectedByCreepingDeath.includes(Number(key)) ? 0.85 : 1),
        ]),
      )
    : defaultDurations;
