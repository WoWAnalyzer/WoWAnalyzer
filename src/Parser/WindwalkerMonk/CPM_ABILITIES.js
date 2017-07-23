import SPELLS from 'common/SPELLS';

export const SPELL_CATEGORY = {
  ROTATIONAL: 'Spell',
  COOLDOWNS: 'Cooldown',
};

const CPM_ABILITIES = [
// Rotational Spells

{
    spell: SPELLS.RISING_SUN_KICK,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => null,
},
{
    spell: SPELLS.BLACKOUT_KICK,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => null,
},
//To Do: Finish adding spells.

  
];

export default CPM_ABILITIES;