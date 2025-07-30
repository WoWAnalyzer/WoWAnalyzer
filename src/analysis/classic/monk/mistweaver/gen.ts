import genAbilities from 'parser/core/modules/genAbilities';
import spells from './spell-list_Monk_Mistweaver.classic';

export const Abilities = genAbilities({
  allSpells: Object.values(spells),
  rotational: [
    spells.UPLIFT,
    spells.EXPEL_HARM,
    spells.BLACKOUT_KICK,
    spells.TIGER_PALM,
    spells.BLACKOUT_KICK,
    spells.RENEWING_MIST,
    spells.CHI_BURST_TALENT,
    spells.CHI_WAVE_TALENT,
    spells.MANA_TEA,
    spells.SPINNING_CRANE_KICK,
    spells.SURGING_MIST_2,
  ],
  cooldowns: [spells.REVIVAL, spells.INVOKE_XUEN_THE_WHITE_TIGER_TALENT, spells.LIFE_COCOON],
  defensives: [
    spells.FORTIFYING_BREW,
    spells.DAMPEN_HARM_TALENT,
    spells.DIFFUSE_MAGIC_TALENT,
    spells.ZEN_MEDITATION,
  ],
  omit: [spells.JAB],
});
