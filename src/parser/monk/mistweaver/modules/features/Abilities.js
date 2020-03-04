import SPELLS from 'common/SPELLS';

import CoreAbilities from 'parser/core/modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      // Rotational Spells
      {
        spell: SPELLS.RENEWING_MIST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 9,
        charges: 2,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 1,
      },
      {
        spell: SPELLS.SOOTHING_MIST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1000,
        },
        timelineSortIndex: 100,
      },

      // Cooldowns
      {
        spell: SPELLS.THUNDER_FOCUS_TEA,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 17,
      },
      {
        spell: SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 3,
      },
      {
        spell: SPELLS.MANA_TEA_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        enabled: combatant.hasTalent(SPELLS.MANA_TEA_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 15,
      },
      {
        spell: SPELLS.CHI_BURST_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.CHI_BURST_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.CHI_WAVE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 15,
        enabled: combatant.hasTalent(SPELLS.CHI_WAVE_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.LIFE_COCOON,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        timelineSortIndex: 17,
      },
      {
        spell: SPELLS.REVIVAL,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 18,
      },

      // Other Spell Casting Metrics

      {
        spell: SPELLS.ENVELOPING_MIST,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 19,
      },
      {
        spell: SPELLS.VIVIFY,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 4,
      },
      {
        spell: SPELLS.ESSENCE_FONT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
        cooldown: 12,
        timelineSortIndex: 2,
      },

      {
        spell: SPELLS.REFRESHING_JADE_WIND_TALENT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.REFRESHING_JADE_WIND_TALENT.id),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 3,
      },
      {
        spell: SPELLS.SUMMON_JADE_SERPENT_STATUE_TALENT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.SUMMON_JADE_SERPENT_STATUE_TALENT.id),
        gcd: {
          base: 1500,
        },
        cooldown: 10,
        timelineSortIndex: 15,
      },

      // Utility Spells
      {
        spell: SPELLS.DIFFUSE_MAGIC_TALENT,
        buffSpellId: SPELLS.DIFFUSE_MAGIC_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 90,
        enabled: combatant.hasTalent(SPELLS.DIFFUSE_MAGIC_TALENT.id),
      },
      {
        spell: SPELLS.DAMPEN_HARM_TALENT,
        buffSpellId: SPELLS.DAMPEN_HARM_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.DAMPEN_HARM_TALENT.id),
      },
      {
        spell: SPELLS.FORTIFYING_BREW,
        buffSpellId: SPELLS.FORTIFYING_BREW.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 90,
      },
      {
        spell: SPELLS.HEALING_ELIXIR_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        charges: 2,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.HEALING_ELIXIR_TALENT.id),
      },
      {
        spell: SPELLS.DETOX,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PARALYSIS,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.RING_OF_PEACE_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.RING_OF_PEACE_TALENT.id),
        gcd: {
          base: 1500,
        },
      },

      {
        spell:SPELLS.LEG_SWEEP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.TIGER_TAIL_SWEEP_TALENT.id) ? 50 : 60,
        gcd: {
          base: 1500,
        },
      },

      {
        spell: SPELLS.ROLL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        charges: combatant.hasTalent(SPELLS.CELERITY_TALENT.id) ? 3 : 2,
        cooldown: combatant.hasTalent(SPELLS.CELERITY_TALENT.id) ? 15 : 20,
        enabled: !combatant.hasTalent(SPELLS.CHI_TORPEDO_TALENT.id),
      },
      {
        spell: SPELLS.CHI_TORPEDO_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        charges: 2,
        cooldown: 20,
        enabled: combatant.hasTalent(SPELLS.CHI_TORPEDO_TALENT.id),
      },
      {
        spell: SPELLS.TIGERS_LUST_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          static: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.TIGERS_LUST_TALENT.id),
      },
      {
        spell: SPELLS.TRANSCENDENCE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TRANSCENDENCE_TRANSFER,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 25,
        gcd: {
          base: 1500,
        },
      },

      // Damage Spells
      {
        spell: SPELLS.TIGER_PALM,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 31,
      },
      {
        spell: SPELLS.BLACKOUT_KICK,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 32,
      },
      {
        spell: SPELLS.RISING_SUN_KICK,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        cooldown: haste => 16 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: combatant.hasTalent(SPELLS.RISING_MIST_TALENT.id),
        },
        timelineSortIndex: 100,
      },
      {
        spell: SPELLS.SPINNING_CRANE_KICK,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 100,
      },
      {
        spell: SPELLS.CRACKLING_JADE_LIGHTNING,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 100,
      },

    ];
  }
}

export default Abilities;
