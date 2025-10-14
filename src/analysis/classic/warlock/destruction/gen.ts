import genAbilities from 'parser/core/modules/genAbilities';
import spells from './spell-list_Warlock_Destruction.classic';

export const Abilities = genAbilities({
  allSpells: Object.values(spells),
  rotational: [
    spells.CHAOS_BOLT,
    spells.CONFLAGRATE,
    spells.CURSE_OF_THE_ELEMENTS,
    spells.IMMOLATE,
    spells.INCINERATE,
    spells.RAIN_OF_FIRE_AFTERMATH_PASSIVE, // casts are showing under this spell id
    spells.SHADOWBURN,
  ],
  cooldowns: [
    spells.DARK_SOUL_INSTABILITY,
    spells.HAVOC,
    spells.GRIMOIRE_OF_SUPREMACY_TALENT,
    spells.SUMMON_DOOMGUARD,
  ],
  defensives: [
    spells.EMBER_TAP,
    spells.UNENDING_RESOLVE,
    spells.SACRIFICIAL_PACT_TALENT,
    spells.DARK_BARGAIN_TALENT,
    spells.DARK_REGENERATION_TALENT,
  ],
});
