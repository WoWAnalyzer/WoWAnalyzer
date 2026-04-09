import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import Spell from 'common/SPELLS/Spell';
import Combatant from 'parser/core/Combatant';

// The 4 buffs that Roll the Bones can grant, so does not include Roll the Bones itself
export const ROLL_THE_BONES_BUFFS: Spell[] = [
  SPELLS.ONE_OF_A_KIND,
  SPELLS.DOUBLE_TROUBLE,
  SPELLS.TRIPLE_THREAT,
  SPELLS.JACKPOT,
];

export const ROLL_THE_BONES_DURATION = 30000;

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
