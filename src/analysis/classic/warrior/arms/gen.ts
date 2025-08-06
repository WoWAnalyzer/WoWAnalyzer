import genAbilities from 'parser/core/modules/genAbilities';
import spells from './spell-list_Warrior_Arms.classic';

export const Abilities = genAbilities({
  allSpells: Object.values(spells),
  rotational: [
    spells.HEROIC_STRIKE,
    spells.SLAM,
    spells.MORTAL_STRIKE,
    spells.COLOSSUS_SMASH,
    spells.BERSERKER_RAGE,
    spells.SWEEPING_STRIKES,
  ],
  defensives: [spells.DIE_BY_THE_SWORD, spells.SHIELD_WALL],
  cooldowns: [
    spells.BLOODBATH_TALENT,
    spells.RECKLESSNESS,
    spells.SKULL_BANNER,
    spells.BLADESTORM_TALENT,
  ],
  omit: [spells.EXECUTE, spells.OVERPOWER],
});
