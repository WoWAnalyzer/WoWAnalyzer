import genAbilities from 'parser/core/modules/genAbilities';
import spells from './spell-list_Mage_Frost.classic';

export const Abilities = genAbilities({
  allSpells: Object.values(spells),
  rotational: [
    spells.FROSTBOLT,
    spells.FROSTFIRE_BOLT,
    spells.ICE_LANCE,
    spells.BLIZZARD,
    spells.CONE_OF_COLD,
  ],
  cooldowns: [
    spells.ALTER_TIME,
    spells.EVOCATION,
    spells.FROZEN_ORB,
    spells.ICE_FLOES_TALENT,
    spells.ICY_VEINS_GLYPH,
    spells.MIRROR_IMAGE,
  ],
  defensives: [
    spells.BLAZING_SPEED_TALENT,
    spells.FROST_NOVA_1,
    spells.FROST_NOVA_2,
    spells.GREATER_INVISIBILITY_TALENT,
    spells.ICE_BLOCK,
    spells.INCANTERS_WARD_TALENT,
    spells.INVISIBILITY,
    spells.RING_OF_FROST,
    spells.TEMPORAL_SHIELD_TALENT,
  ],
  overrides: {
    [spells.EVOCATION.id]: (combatant, generated) => {
      if (!generated) {
        throw new Error('generated spell must be listed above');
      }
      if (combatant.hasClassicTalent(spells.INVOCATION_TALENT.id)) {
        return {
          ...generated,
          cooldown: 0,
        };
      } else {
        return generated;
      }
    },
  },
});
