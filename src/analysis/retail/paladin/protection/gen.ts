import genAbilities from 'parser/core/modules/genAbilities';
import spells from './spells';

export const Abilities = genAbilities({
  allSpells: spells,
  rotational: [
    spells.CONSECRATION_1,
    spells.BLESSED_HAMMER_TALENT,
    spells.HAMMER_OF_THE_RIGHTEOUS_TALENT,
    spells.AVENGERS_SHIELD_TALENT,
    spells.SHIELD_OF_THE_RIGHTEOUS,
    spells.JUDGMENT,
    spells.HAMMER_OF_WRATH,
    spells.HAMMER_OF_LIGHT,
    spells.CRUSADER_STRIKE,
  ],
  cooldowns: [spells.AVENGING_WRATH_TALENT, spells.SENTINEL_TALENT],
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
    [spells.CONSECRATION_1.id]: (combatant, generated) => {
      if (!generated) throw new Error('Consecration not found');
      return {
        ...generated,
        // Cooldown reduced by 50% via passive (character level 23+)
        cooldown: (haste) => 4.5 / (1 + haste),
      };
    },
    [spells.AVENGING_WRATH_TALENT.id]: (combatant, generated) => {
      if (!generated) throw new Error('Avenging Wrath not found');
      const hasRP = combatant.hasTalent(spells.RIGHTEOUS_PROTECTOR_TALENT);
      const hasSW = combatant.hasTalent(spells.SANCTIFIED_WRATH_TALENT);
      const baseDuration = hasSW ? 25000 : 20000;
      const duration = hasRP ? baseDuration * 0.6 : baseDuration;
      const cooldown = hasRP ? 60 : 120;
      return { ...generated, cooldown, duration };
    },
    [spells.HAMMER_OF_LIGHT.id]: (combatant, generated) => {
      if (!generated) throw new Error('Hammer of Light not found');
      // Only Templar (Lights Guidance) has access to it.
      return { ...generated, enabled: combatant.hasTalent(spells.LIGHTS_GUIDANCE_TALENT) };
    },
    [spells.SENTINEL_TALENT.id]: (combatant, generated) => {
      if (!generated) throw new Error('Sentinel not found');
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
