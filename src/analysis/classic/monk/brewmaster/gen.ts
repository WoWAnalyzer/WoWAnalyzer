import genAbilities from 'parser/core/modules/genAbilities';
import spells from './spell-list_Monk_Brewmaster.classic';
import type { RetailSpell } from 'wow-dbc';

export const Abilities = genAbilities({
  allSpells: Object.values(spells) as RetailSpell[],
  rotational: [
    spells.BLACKOUT_KICK,
    spells.TIGER_PALM,
    spells.KEG_SMASH,
    spells.CHI_WAVE_TALENT,
    spells.BREATH_OF_FIRE,
    // another readonly issue...
    spells.SPINNING_CRANE_KICK as unknown as RetailSpell,
  ],
  defensives: [spells.FORTIFYING_BREW, spells.DIFFUSE_MAGIC_TALENT, spells.DAMPEN_HARM_TALENT],
  cooldowns: [],
  omit: [spells.JAB],
});
