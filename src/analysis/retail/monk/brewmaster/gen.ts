import genAbilities from 'parser/core/modules/genAbilities';
import spells from './spell-list_Monk_Brewmaster.retail';
import SPELLS_COMMON from 'common/SPELLS';

export const Abilities = genAbilities({
  allSpells: spells,
  rotational: [
    spells.BLACKOUT_KICK,
    spells.TIGER_PALM,
    spells.SPINNING_CRANE_KICK,
    spells.KEG_SMASH_TALENT,
  ],
  cooldowns: [spells.INVOKE_NIUZAO_THE_BLACK_OX_TALENT, spells.EXPLODING_KEG_TALENT],
  defensives: [spells.FORTIFYING_BREW],
  omit: [spells.BREATH_OF_FIRE_TALENT],
  overrides: {
    [spells.CHI_BURST_TALENT.id]: (_combatant, generated) => ({
      ...generated,
      damageSpellIds: [SPELLS_COMMON.CHI_BURST_TALENT_DAMAGE.id],
    }),
  },
});
