import genAbilities from 'parser/core/modules/genAbilities';
import spells from './spell-list_Paladin_Protection.retail';
import { HAMMER_OF_WRATH, SACRED_WEAPON, FINAL_STAND } from './missing_spells';
import { SpellbookAbility } from 'parser/core/modules/Ability';

export const Abilities = genAbilities({
  allSpells: {
    ...spells,
    [HAMMER_OF_WRATH.id]: HAMMER_OF_WRATH,
    [SACRED_WEAPON.id]: SACRED_WEAPON,
    [FINAL_STAND.id]: FINAL_STAND,
  },

  rotational: [
    spells.CONSECRATION_1,
    spells.BLESSED_HAMMER_TALENT,
    spells.HAMMER_OF_THE_RIGHTEOUS_TALENT,
    spells.AVENGERS_SHIELD_TALENT,
    spells.SHIELD_OF_THE_RIGHTEOUS,
    spells.JUDGMENT,
    HAMMER_OF_WRATH, // missing
  ],

  cooldowns: [
    spells.HOLY_BULWARK_TALENT,
    SACRED_WEAPON, // missing
    spells.AVENGING_WRATH_TALENT,
    spells.SENTINEL_TALENT,
    spells.DIVINE_TOLL_TALENT,
  ],

  defensives: [
    spells.ARDENT_DEFENDER_TALENT,
    spells.GUARDIAN_OF_ANCIENT_KINGS_TALENT,
    spells.DIVINE_SHIELD,
    spells.LAY_ON_HANDS_TALENT,
    spells.BLESSING_OF_PROTECTION_TALENT,
    spells.BLESSING_OF_SPELLWARDING_TALENT,
  ],

  overrides: {
    [spells.AVENGING_WRATH_TALENT.id]: (combatant, generated) => {
      const hasRP = combatant.hasTalent(spells.RIGHTEOUS_PROTECTOR_TALENT);
      const hasSW = combatant.hasTalent(spells.SANCTIFIED_WRATH_TALENT);
      const baseDuration = hasSW ? 25000 : 20000;
      const duration = hasRP ? baseDuration * 0.6 : baseDuration;
      const cooldown = hasRP ? 60 : 120;

      return {
        ...generated,
        cooldown,
        duration,
      } as SpellbookAbility;
    },

    [spells.SENTINEL_TALENT.id]: (combatant, generated) => {
      const hasRP = combatant.hasTalent(spells.RIGHTEOUS_PROTECTOR_TALENT);
      const hasSW = combatant.hasTalent(spells.SANCTIFIED_WRATH_TALENT);
      const baseDuration = hasSW ? 20000 : 16000;
      const duration = hasRP ? baseDuration * 0.6 : baseDuration;
      const cooldown = hasRP ? 60 : 120;

      return {
        ...generated,
        cooldown,
        duration,
      } as SpellbookAbility;
    },
  },

  omit: [spells.CONSECRATION_2],
});
