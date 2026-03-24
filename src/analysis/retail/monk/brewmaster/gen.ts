import genAbilities from 'parser/core/modules/genAbilities';
import spells from './spell-list_Monk_Brewmaster.retail';

export const Abilities = genAbilities({
  allSpells: spells,
  rotational: [
    spells.BLACKOUT_KICK,
    spells.TIGER_PALM,
    spells.SPINNING_CRANE_KICK,
    spells.KEG_SMASH_TALENT,
    spells.BREATH_OF_FIRE_TALENT,
  ],
  cooldowns: [spells.INVOKE_NIUZAO_THE_BLACK_OX_TALENT],
  defensives: [spells.FORTIFYING_BREW],
  omit: [spells.BREATH_OF_FIRE_TALENT],
});
