import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../constants';

class Abilities extends CoreAbilities {
  constructor(...args: ConstructorParameters<typeof CoreAbilities>) {
    super(...args);
    this.abilitiesAffectedByHealingIncreases = ABILITIES_AFFECTED_BY_HEALING_INCREASES;
  }

  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      // Rotational Spells
      {
        spell: TALENTS_MONK.RENEWING_MIST_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
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
        spell: TALENTS_MONK.SOOTHING_MIST_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1000,
        },
        timelineSortIndex: 100,
      },
      {
        spell: TALENTS_MONK.FAELINE_STOMP_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30,
        enabled: combatant.hasTalent(TALENTS_MONK.FAELINE_STOMP_TALENT),
        gcd: {
          base: 1500,
        },
      },
      // Cooldowns
      {
        spell: TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 17,
      },
      {
        spell: TALENTS_MONK.MANA_TEA_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        enabled: combatant.hasTalent(TALENTS_MONK.MANA_TEA_TALENT),
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 15,
      },
      {
        spell: TALENTS_MONK.CHI_BURST_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        enabled: combatant.hasTalent(TALENTS_MONK.CHI_BURST_TALENT),
        castEfficiency: {
          suggestion: true,
        },
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 10,
      },
      {
        spell: TALENTS_MONK.CHI_WAVE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 15,
        enabled: combatant.hasTalent(TALENTS_MONK.CHI_WAVE_TALENT),
        castEfficiency: {
          suggestion: true,
        },
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 10,
      },
      {
        spell: TALENTS_MONK.LIFE_COCOON_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 17,
      },
      {
        spell: TALENTS_MONK.REVIVAL_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS_MONK.REVIVAL_TALENT),
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 18,
      },
      {
        spell: TALENTS_MONK.RESTORAL_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS_MONK.RESTORAL_TALENT),
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 18,
      },
      {
        spell: TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT),
        cooldown: combatant.hasTalent(TALENTS_MONK.GIFT_OF_THE_CELESTIALS_TALENT) ? 60 : 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 20,
      },
      {
        spell: TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT),
        cooldown: combatant.hasTalent(TALENTS_MONK.GIFT_OF_THE_CELESTIALS_TALENT) ? 60 : 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 20,
      },

      // Other Spell Casting Metrics
      {
        spell: TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 19,
      },
      {
        spell: SPELLS.VIVIFY.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 4,
      },
      {
        spell: TALENTS_MONK.ESSENCE_FONT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_MONK.ESSENCE_FONT_TALENT),
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        cooldown: 12,
        timelineSortIndex: 2,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: this.selectedCombatant.hasTalent(TALENTS_MONK.UPWELLING_TALENT)
            ? 0.4
            : 0.72,
        },
      },
      {
        spell: TALENTS_MONK.REFRESHING_JADE_WIND_TALENT.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS_MONK.REFRESHING_JADE_WIND_TALENT),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 3,
      },
      {
        spell: TALENTS_MONK.SUMMON_JADE_SERPENT_STATUE_TALENT.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS_MONK.SUMMON_JADE_SERPENT_STATUE_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 10,
        timelineSortIndex: 15,
      },
      {
        spell: SPELLS.EXPEL_HARM.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1000,
        },
        cooldown: 15,
      },
      {
        spell: TALENTS_MONK.SHEILUNS_GIFT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_MONK.SHEILUNS_GIFT_TALENT),
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        cooldown: combatant.hasTalent(TALENTS_MONK.VEIL_OF_PRIDE_TALENT) ? 4 : 8,
      },

      // Utility Spells
      {
        spell: TALENTS_MONK.DIFFUSE_MAGIC_TALENT.id,
        buffSpellId: TALENTS_MONK.DIFFUSE_MAGIC_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 90,
        enabled: combatant.hasTalent(TALENTS_MONK.DIFFUSE_MAGIC_TALENT),
      },
      {
        spell: TALENTS_MONK.DAMPEN_HARM_TALENT.id,
        buffSpellId: TALENTS_MONK.DAMPEN_HARM_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        enabled: combatant.hasTalent(TALENTS_MONK.DAMPEN_HARM_TALENT),
      },
      {
        spell: TALENTS_MONK.FORTIFYING_BREW_TALENT.id,
        buffSpellId: TALENTS_MONK.FORTIFYING_BREW_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: combatant.hasTalent(TALENTS_MONK.EXPEDITIOUS_FORTIFICATION_TALENT) ? 240 : 360,
        enabled: combatant.hasTalent(TALENTS_MONK.FORTIFYING_BREW_TALENT),
      },
      {
        spell: TALENTS_MONK.HEALING_ELIXIR_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        charges: 2,
        cooldown: 30,
        enabled: combatant.hasTalent(TALENTS_MONK.HEALING_ELIXIR_TALENT),
      },
      {
        spell: SPELLS.DETOX.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_MONK.PARALYSIS_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        enabled: combatant.hasTalent(TALENTS_MONK.PARALYSIS_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_MONK.RING_OF_PEACE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        enabled: combatant.hasTalent(TALENTS_MONK.RING_OF_PEACE_TALENT),
        gcd: {
          base: 1500,
        },
      },

      {
        spell: SPELLS.LEG_SWEEP.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS_MONK.TIGER_TAIL_SWEEP_TALENT) ? 50 : 60,
        gcd: {
          base: 1500,
        },
      },

      {
        spell: SPELLS.ROLL.id,
        category: SPELL_CATEGORY.UTILITY,
        charges: combatant.hasTalent(TALENTS_MONK.CELERITY_TALENT) ? 3 : 2,
        cooldown: combatant.hasTalent(TALENTS_MONK.CELERITY_TALENT) ? 15 : 20,
        enabled: !combatant.hasTalent(TALENTS_MONK.CHI_TORPEDO_TALENT),
      },
      {
        spell: TALENTS_MONK.CHI_TORPEDO_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        charges: 2,
        cooldown: 20,
        enabled: combatant.hasTalent(TALENTS_MONK.CHI_TORPEDO_TALENT),
      },
      {
        spell: TALENTS_MONK.TIGERS_LUST_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          static: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_MONK.TIGERS_LUST_TALENT),
      },
      {
        spell: TALENTS_MONK.TRANSCENDENCE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 10,
        enabled: combatant.hasTalent(TALENTS_MONK.TRANSCENDENCE_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TRANSCENDENCE_TRANSFER.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },

      // Damage Spells
      {
        spell: SPELLS.TIGER_PALM.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 31,
      },
      {
        spell: SPELLS.BLACKOUT_KICK.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        cooldown: (haste: number) => 3 / (1 + haste),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 32,
      },
      {
        spell: TALENTS_MONK.RISING_SUN_KICK_TALENT.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        cooldown: (haste: number) => 12 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT),
        },
        timelineSortIndex: 100,
      },
      {
        spell: SPELLS.SPINNING_CRANE_KICK.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 100,
      },
      {
        spell: SPELLS.CRACKLING_JADE_LIGHTNING.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 100,
      },
      {
        spell: TALENTS_MONK.ZEN_PULSE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS_MONK.ZEN_PULSE_TALENT),
        cooldown: 30,
        castEfficiency: {
          suggestion: true,
        },
        gcd: {
          base: 1500,
          timelineSortIndex: 100,
        },
      },
    ];
  }
}

export default Abilities;
