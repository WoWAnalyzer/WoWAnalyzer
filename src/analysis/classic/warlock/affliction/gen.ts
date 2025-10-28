import genAbilities from 'parser/core/modules/genAbilities';
import spells from './spell-list_Warlock_Affliction.classic';

export const Abilities = genAbilities({
  allSpells: Object.values(spells),
  rotational: [
    spells.AGONY_1,
    spells.CORRUPTION_1,
    spells.HAUNT,
    spells.MALEFIC_GRASP,
    spells.SOUL_SWAP_1,
    spells.SOUL_SWAP_2,
    spells.UNSTABLE_AFFLICTION_1,
  ],
  cooldowns: [spells.DARK_SOUL_MISERY, spells.SOULBURN, spells.SUMMON_DOOMGUARD],
  defensives: [
    spells.DARK_BARGAIN_TALENT,
    spells.DARK_REGENERATION_TALENT,
    spells.SACRIFICIAL_PACT_TALENT,
    spells.TWILIGHT_WARD,
    spells.UNBOUND_WILL_TALENT,
    spells.UNENDING_RESOLVE,
  ],
});
