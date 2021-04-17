import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';

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
