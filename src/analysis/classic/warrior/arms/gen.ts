import genAbilities from 'parser/core/modules/genAbilities';
import spells from './spell-list_Warrior_Arms.classic';
import type { RetailSpell } from 'wow-dbc';

export const Abilities = genAbilities({
  allSpells: Object.values(spells) as RetailSpell[],
  rotational: [
    spells.HEROIC_STRIKE,
    spells.SLAM,
    spells.MORTAL_STRIKE,
    spells.COLOSSUS_SMASH,
    spells.BERSERKER_RAGE,
    spells.SWEEPING_STRIKES_3,
  ],
  defensives: [spells.DIE_BY_THE_SWORD, spells.SHIELD_WALL],
  cooldowns: [spells.BLOODBATH_2, spells.RECKLESSNESS, spells.SKULL_BANNER, spells.BLADESTORM_2],
  omit: [spells.EXECUTE, spells.OVERPOWER],
});
