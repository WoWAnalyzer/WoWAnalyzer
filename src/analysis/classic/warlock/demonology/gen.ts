import genAbilities from 'parser/core/modules/genAbilities';
import spells from './spell-list_Warlock_Demonology.classic';

export const Abilities = genAbilities({
  allSpells: Object.values(spells),
  rotational: [spells.CORRUPTION_1, spells.HAND_OF_GULDAN, spells.SHADOW_BOLT, spells.SOUL_FIRE],
  cooldowns: [
    spells.DARK_SOUL_KNOWLEDGE,
    spells.GRIMOIRE_OF_SERVICE_HIDDEN,
    spells.IMP_SWARM,
    spells.SUMMON_DOOMGUARD,
  ],
  defensives: [
    spells.DARK_BARGAIN_TALENT,
    spells.DARK_REGENERATION_TALENT,
    spells.SACRIFICIAL_PACT_TALENT,
    spells.TWILIGHT_WARD,
    spells.UNBOUND_WILL_TALENT,
    spells.UNENDING_RESOLVE,
  ],
  overrides: {
    [spells.DARK_SOUL_KNOWLEDGE.id]: (combatant, generated) => {
      if (!generated) {
        throw new Error(
          "type checker can't tell that we're guaranteed to have this spell in the list",
        );
      }
      const archimondes = combatant.hasClassicTalent(spells.ARCHIMONDES_DARKNESS_TALENT);
      if (archimondes) {
        return {
          ...generated,
          cooldown: 20,
        };
      } else return generated;
    },
    [spells.IMP_SWARM.id]: (combatant, generated) => {
      if (!generated) {
        throw new Error(
          "type checker can't tell that we're guaranteed to have this spell in the list",
        );
      }
      const impswarm = combatant.hasGlyph(spells.GLYPH_OF_IMP_SWARM.glyphId);
      if (impswarm) {
        return {
          ...generated,
          cooldown: (haste) => 124 / (1 + haste),
        };
      } else return generated;
    },
  },
});
