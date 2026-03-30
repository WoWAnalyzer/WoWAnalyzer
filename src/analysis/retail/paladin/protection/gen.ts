import genAbilities from 'parser/core/modules/genAbilities';
import spells from './spell-list_Paladin_Protection.retail';

export const GenAbilities = genAbilities({
  allSpells: spells,
  rotational: [
    spells.CONSECRATION_1,
    spells.BLESSED_HAMMER_TALENT,
    spells.HAMMER_OF_THE_RIGHTEOUS_TALENT,
    spells.AVENGERS_SHIELD_TALENT,
    spells.SHIELD_OF_THE_RIGHTEOUS,
    spells.JUDGMENT,
    spells.CRUSADER_STRIKE,
  ],
  cooldowns: [
    spells.HOLY_BULWARK_TALENT,
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
    spells.WORD_OF_GLORY,
  ],
  overrides: {
    // Avenging Wrath – adjust cooldown & duration for Righteous Protector & Sanctified Wrath
    [spells.AVENGING_WRATH_TALENT.id]: (combatant, generated) => {
      if (!generated) {
        throw new Error('Avenging Wrath ability not found in generated spells');
      }
      const hasRP = combatant.hasTalent(spells.RIGHTEOUS_PROTECTOR_TALENT);
      const hasSW = combatant.hasTalent(spells.SANCTIFIED_WRATH_TALENT);
      const baseDuration = hasSW ? 25000 : 20000;
      const duration = hasRP ? baseDuration * 0.6 : baseDuration;
      const cooldown = hasRP ? 60 : 120;
      return { ...generated, cooldown, duration };
    },
    // Sentinel – same logic
    [spells.SENTINEL_TALENT.id]: (combatant, generated) => {
      if (!generated) {
        throw new Error('Sentinel ability not found in generated spells');
      }
      const hasRP = combatant.hasTalent(spells.RIGHTEOUS_PROTECTOR_TALENT);
      const hasSW = combatant.hasTalent(spells.SANCTIFIED_WRATH_TALENT);
      const baseDuration = hasSW ? 20000 : 16000;
      const duration = hasRP ? baseDuration * 0.6 : baseDuration;
      const cooldown = hasRP ? 60 : 120;
      return { ...generated, cooldown, duration };
    },
  },
  omit: [spells.CONSECRATION_2, spells.HOLY_BULWARK_TALENT],
});
