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
        spell: SPELLS.RENEWING_MIST.id,
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
        spell: SPELLS.SOOTHING_MIST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1000,
        },
        timelineSortIndex: 100,
      },

      // Cooldowns
      {
        spell: SPELLS.THUNDER_FOCUS_TEA.id,
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
        enabled: combatant.hasTalent(TALENTS_MONK.MANA_TEA_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 15,
      },
      {
        spell: TALENTS_MONK.CHI_BURST_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        enabled: combatant.hasTalent(TALENTS_MONK.CHI_BURST_TALENT.id),
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
        enabled: combatant.hasTalent(TALENTS_MONK.CHI_WAVE_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.LIFE_COCOON.id,
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
        spell: SPELLS.INVOKE_YULON_THE_JADE_SERPENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: !combatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id),
        cooldown: 180,
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
        enabled: combatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT.id),
        cooldown: 180,
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
        spell: SPELLS.ENVELOPING_MIST.id,
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
        spell: SPELLS.ESSENCE_FONT.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        cooldown: 12,
        timelineSortIndex: 2,
      },

      {
        spell: TALENTS_MONK.REFRESHING_JADE_WIND_TALENT.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS_MONK.REFRESHING_JADE_WIND_TALENT.id),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 3,
      },
      {
        spell: TALENTS_MONK.SUMMON_JADE_SERPENT_STATUE_TALENT.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS_MONK.SUMMON_JADE_SERPENT_STATUE_TALENT.id),
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

      // Utility Spells
      {
        spell: TALENTS_MONK.DIFFUSE_MAGIC_TALENT.id,
        buffSpellId: TALENTS_MONK.DIFFUSE_MAGIC_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 90,
        enabled: combatant.hasTalent(TALENTS_MONK.DIFFUSE_MAGIC_TALENT.id),
      },
      {
        spell: TALENTS_MONK.DAMPEN_HARM_TALENT.id,
        buffSpellId: TALENTS_MONK.DAMPEN_HARM_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        enabled: combatant.hasTalent(TALENTS_MONK.DAMPEN_HARM_TALENT.id),
      },
      {
        spell: TALENTS_MONK.FORTIFYING_BREW_SHARED_TALENT.id,
        buffSpellId: TALENTS_MONK.FORTIFYING_BREW_SHARED_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 180,
      },
      {
        spell: TALENTS_MONK.HEALING_ELIXIR_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        charges: 2,
        cooldown: 30,
        enabled: combatant.hasTalent(TALENTS_MONK.HEALING_ELIXIR_TALENT.id),
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
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_MONK.RING_OF_PEACE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        enabled: combatant.hasTalent(TALENTS_MONK.RING_OF_PEACE_TALENT.id),
        gcd: {
          base: 1500,
        },
      },

      {
        spell: SPELLS.LEG_SWEEP.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS_MONK.TIGER_TAIL_SWEEP_TALENT.id) ? 50 : 60,
        gcd: {
          base: 1500,
        },
      },

      {
        spell: SPELLS.ROLL.id,
        category: SPELL_CATEGORY.UTILITY,
        charges: combatant.hasTalent(TALENTS_MONK.CELERITY_TALENT.id) ? 3 : 2,
        cooldown: combatant.hasTalent(TALENTS_MONK.CELERITY_TALENT.id) ? 15 : 20,
        enabled: !combatant.hasTalent(TALENTS_MONK.CHI_TORPEDO_TALENT.id),
      },
      {
        spell: TALENTS_MONK.CHI_TORPEDO_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        charges: 2,
        cooldown: 20,
        enabled: combatant.hasTalent(TALENTS_MONK.CHI_TORPEDO_TALENT.id),
      },
      {
        spell: TALENTS_MONK.TIGERS_LUST_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          static: 1500,
        },
        enabled: combatant.hasTalent(TALENTS_MONK.TIGERS_LUST_TALENT.id),
      },
      {
        spell: TALENTS_MONK.TRANSCENDENCE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 10,
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
        spell: SPELLS.RISING_SUN_KICK.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        cooldown: (haste: number) => 12 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS_MONK.RISING_MIST_TALENT.id),
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
    ];
  }
}

export default Abilities;
