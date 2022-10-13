import SPELLS from 'common/SPELLS';
import { TALENTS_MONK, TALENTS_PRIEST, TALENTS_PALADIN } from 'common/TALENTS';

//saving it as spell-prop as this might be a good place to add further information about the externals (for issue #1083)

const DEFENSIVE_BUFFS = [
  {
    spell: SPELLS.IRONBARK.id,
  },
  {
    spell: TALENTS_MONK.LIFE_COCOON_TALENT.id,
  },
  {
    spell: TALENTS_PALADIN.BLESSING_OF_PROTECTION_TALENT.id,
  },
  {
    spell: TALENTS_PALADIN.BLESSING_OF_SACRIFICE_TALENT.id,
  },
  {
    spell: TALENTS_PRIEST.GUARDIAN_SPIRIT_TALENT.id,
  },
  {
    spell: SPELLS.PAIN_SUPPRESSION.id,
  },
  {
    spell: SPELLS.POWER_WORD_BARRIER_BUFF.id,
  },

  //Blood Death-Knight
  {
    spell: SPELLS.BONE_SHIELD.id,
  },
  {
    spell: SPELLS.SHROUD_OF_PURGATORY.id,
  },
  //Arms & Fury Warrior
  {
    spell: SPELLS.RALLYING_CRY_BUFF.id,
  },
  //Shaman
  {
    spell: SPELLS.SPIRIT_WOLF_BUFF.id,
  },
];

export default DEFENSIVE_BUFFS;
