import SPELLS from 'common/SPELLS';

export const SPELL_CATEGORY = {
  ROTATIONAL: 'Spell',
  COOLDOWNS: 'Cooldown',
};

const CPM_ABILITIES = [
// Rotational Spells
{
    spell: SPELLS.BLACK_OUT_KICK_MIST,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => null,
},
// To Do: Finish adding spells.

  
];

export default CPM_ABILITIES;