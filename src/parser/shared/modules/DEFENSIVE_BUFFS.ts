import SPELLS from 'common/SPELLS';

//saving it as spell-prop as this might be a good place to add further information about the externals (for issue #1083)

const DEFENSIVE_BUFFS = [
  {
    spell: SPELLS.IRONBARK.id,
  },
  {
    spell: SPELLS.LIFE_COCOON.id,
  },
  {
    spell: SPELLS.BLESSING_OF_PROTECTION.id,
  },
  {
    spell: SPELLS.BLESSING_OF_SACRIFICE.id,
  },
  {
    spell: SPELLS.GUARDIAN_SPIRIT.id,
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
  //Vengence Demon Hunter
  {
    spell: SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id,
  },
  //Arms Warrior
  {
    spell: SPELLS.DEFENSIVE_STANCE_TALENT.id,
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
