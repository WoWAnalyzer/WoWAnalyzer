import genAbilities from 'parser/core/modules/genAbilities';
import spells from './spell-list_Monk_Windwalker.classic';

// TODO WCL doesn't have the set id for these items. not sure why. in the meantime, hardcode ids for FoF CDR
const MSV_HOF_TOES_TIER_ITEM_IDS = [87086, 87088, 87084, 87087, 86964];

export const Abilities = genAbilities({
  allSpells: Object.values(spells),
  rotational: [
    spells.BLACKOUT_KICK,
    spells.TIGER_PALM,
    spells.FISTS_OF_FURY,
    spells.SPINNING_CRANE_KICK,
    spells.RISING_SUN_KICK,
    spells.CHI_WAVE_TALENT,
    spells.TIGEREYE_BREW_2,
    spells.CHI_BREW_TALENT,
  ],
  cooldowns: [
    // TODO: touch of death execute. it is more complicated in mop, not a fixed % of target hp
    spells.TOUCH_OF_DEATH,
    spells.INVOKE_XUEN_THE_WHITE_TIGER_TALENT,
    spells.ENERGIZING_BREW,
  ],
  defensives: [spells.FORTIFYING_BREW, spells.TOUCH_OF_KARMA, spells.NIMBLE_BREW],
  omit: [spells.JAB],
  overrides: {
    [spells.FISTS_OF_FURY.id]: (combatant, generated) => {
      if (!generated) {
        throw new Error(); // type checker can't tell that we're guaranteed to have this spell in the list
      }

      const hofTierSetCount = combatant.tierPieces.filter((item) =>
        MSV_HOF_TOES_TIER_ITEM_IDS.includes(item.id),
      ).length;
      if (hofTierSetCount >= 2) {
        return {
          ...generated,
          cooldown: 20,
        };
      } else {
        return generated;
      }
    },
  },
});
