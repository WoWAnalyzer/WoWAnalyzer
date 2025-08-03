import genAbilities from 'parser/core/modules/genAbilities';
import spells from './spell-list_Monk_Brewmaster.classic';

export const Abilities = genAbilities({
  allSpells: Object.values(spells),
  rotational: [
    spells.BLACKOUT_KICK,
    spells.TIGER_PALM,
    spells.KEG_SMASH,
    spells.CHI_WAVE_TALENT,
    spells.BREATH_OF_FIRE,
    spells.SPINNING_CRANE_KICK,
  ],
  defensives: [spells.FORTIFYING_BREW, spells.DIFFUSE_MAGIC_TALENT, spells.DAMPEN_HARM_TALENT],
  cooldowns: [spells.INVOKE_XUEN_THE_WHITE_TIGER_TALENT],
  omit: [spells.JAB],
});
