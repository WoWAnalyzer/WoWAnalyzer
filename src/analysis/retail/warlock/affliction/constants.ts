import SPELLS from 'common/SPELLS';
import covenantSpells from 'common/SPELLS/shadowlands/covenants/warlock'
import talents from 'common/TALENTS/warlock';
import Combatant from 'parser/core/Combatant';

const defaultDurations = {
  // Baseline spells
  [SPELLS.AGONY.id]: 18000,
  [SPELLS.CORRUPTION_DEBUFF.id]: 14000,
  // Talents
  [talents.SIPHON_LIFE_TALENT.id]: 15000,
  [talents.UNSTABLE_AFFLICTION_TALENT.id]: 16000,
  [talents.PHANTOM_SINGULARITY_TALENT.id]: 16000,
  [talents.VILE_TAINT_TALENT.id]: 10000,
  [talents.SOUL_ROT_TALENT.id]: 8000,
  // Shadowlands Covenant Abilities
  [covenantSpells.SCOURING_TITHE.id]: 18000,
  [covenantSpells.SOUL_ROT.id]: 8000,
  [covenantSpells.IMPENDING_CATASTROPHE_DEBUFF.id]: 12000,
} as const;

const affectedByCreepingDeath = [
  SPELLS.AGONY.id,
  SPELLS.CORRUPTION_DEBUFF.id,
  talents.SIPHON_LIFE_TALENT.id,
  talents.UNSTABLE_AFFLICTION_TALENT.id,
] as const;

export const getDotDurations = (combatant: Combatant): Record<number, number> =>
  combatant.hasTalent(talents.CREEPING_DEATH_TALENT.id)
    ? Object.fromEntries(
        Object.entries(defaultDurations).map(([key, value]) => [
          key,
          value * (affectedByCreepingDeath.includes(parseInt(key)) ? 0.85 : 1),
        ]),
      )
    : defaultDurations;
