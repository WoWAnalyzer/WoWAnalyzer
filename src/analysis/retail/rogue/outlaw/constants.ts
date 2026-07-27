import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import Spell from 'common/SPELLS/Spell';
import Combatant from 'parser/core/Combatant';

// Stages 1-4 in order: One of a Kind, Double Trouble, Triple Threat, Jackpot.
export const ROLL_THE_BONES_STAGE_AURAS: Spell[] = [
  SPELLS.ONE_OF_A_KIND,
  SPELLS.DOUBLE_TROUBLE,
  SPELLS.TRIPLE_THREAT,
  SPELLS.JACKPOT,
];

export const ROLL_THE_BONES_BUFFS = ROLL_THE_BONES_STAGE_AURAS;

export const ROLL_THE_BONES_DURATION = 30000;

const BASE_GCD = 1000;
const ADRENALINE_RUSH_MAX_GCD_REDUCTION = 200;
const ADRENALINE_RUSH_GCD_REDUCTION_HASTE_CAP = 0.25;

/**
 * SimC's `rogue_action_t::gcd()`: Adrenaline Rush takes up to 200ms off Outlaw's flat 1s GCD,
 * ramping linearly with Haste to a 25% cap SimC hardcodes rather than reading from spell data.
 */
export function adrenalineRushGcd(hastePercentage: number): number {
  const cappedHaste = Math.min(
    Math.max(hastePercentage, 0),
    ADRENALINE_RUSH_GCD_REDUCTION_HASTE_CAP,
  );
  const reduction =
    (cappedHaste / ADRENALINE_RUSH_GCD_REDUCTION_HASTE_CAP) * ADRENALINE_RUSH_MAX_GCD_REDUCTION;

  return BASE_GCD - reduction;
}

export const getMaxComboPoints = (c: Combatant) => {
  return (
    5 +
    c.getTalentRank(TALENTS.DEEPER_STRATAGEM_TALENT) +
    c.getTalentRank(TALENTS.DEVIOUS_STRATAGEM_TALENT)
  );
};

export const BUILDERS: Spell[] = [
  SPELLS.SINISTER_STRIKE,
  SPELLS.AMBUSH,
  SPELLS.PISTOL_SHOT,
  SPELLS.CHEAP_SHOT,
  TALENTS.SHIV_TALENT,
  TALENTS.GOUGE_TALENT,
  TALENTS.ECHOING_REPRIMAND_TALENT,
  TALENTS.ACE_UP_YOUR_SLEEVE_TALENT,
];

export const FINISHERS: Spell[] = [
  SPELLS.DISPATCH,
  SPELLS.BETWEEN_THE_EYES,
  SPELLS.SLICE_AND_DICE,
  SPELLS.KIDNEY_SHOT,
  TALENTS.KILLING_SPREE_TALENT,
  SPELLS.COUP_DE_GRACE_CAST,
];
