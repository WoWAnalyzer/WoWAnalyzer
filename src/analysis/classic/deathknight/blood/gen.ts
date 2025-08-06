import genAbilities from 'parser/core/modules/genAbilities';
import spells from './spell-list_DeathKnight_Blood.classic';

export const Abilities = genAbilities({
  allSpells: Object.values(spells),
  rotational: [
    spells.RUNE_STRIKE,
    spells.HEART_STRIKE,
    spells.DEATH_STRIKE,
    spells.SOUL_REAPER,
    spells.BLOOD_BOIL,
    spells.HORN_OF_WINTER,
    spells.DEATH_AND_DECAY_1,
  ],
  defensives: [
    spells.BONE_SHIELD,
    spells.VAMPIRIC_BLOOD,
    spells.ANTI_MAGIC_SHELL,
    spells.ICEBOUND_FORTITUDE,
    spells.RUNE_TAP,
    spells.DEATH_PACT_TALENT,
  ],
  cooldowns: [spells.DANCING_RUNE_WEAPON, spells.EMPOWER_RUNE_WEAPON, spells.ARMY_OF_THE_DEAD],
});
