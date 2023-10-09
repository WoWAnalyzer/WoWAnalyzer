import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import Spell from 'common/SPELLS/Spell';
import Combatant from 'parser/core/Combatant';

// The 6 buffs that Roll the Bones can grant, so does not include Roll the Bones itself
export const ROLL_THE_BONES_BUFFS: Spell[] = [
  SPELLS.RUTHLESS_PRECISION,
  SPELLS.GRAND_MELEE,
  SPELLS.BROADSIDE,
  SPELLS.SKULL_AND_CROSSBONES,
  SPELLS.BURIED_TREASURE,
  SPELLS.TRUE_BEARING,
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
  TALENTS.SEPSIS_TALENT,
  TALENTS.GHOSTLY_STRIKE_TALENT,
];

export const FINISHERS: Spell[] = [
  SPELLS.DISPATCH,
  SPELLS.BETWEEN_THE_EYES,
  SPELLS.SLICE_AND_DICE,
  SPELLS.KIDNEY_SHOT,
];
