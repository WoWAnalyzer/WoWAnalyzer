import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

import lowRankSpells from '../lowRankSpells';
import * as SPELLS from '../SPELLS';
import { Build } from 'analysis/classic/priest/CONFIG';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const baseSpells: SpellbookAbility[] = [
      {
        spell: [SPELLS.SHOOT],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.FLASH_HEAL, ...lowRankSpells[SPELLS.FLASH_HEAL]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.GREATER_HEAL, ...lowRankSpells[SPELLS.GREATER_HEAL]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.RENEW, ...lowRankSpells[SPELLS.RENEW]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.POWER_WORD_SHIELD, ...lowRankSpells[SPELLS.POWER_WORD_SHIELD]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.BINDING_HEAL,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.PRAYER_OF_MENDING,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
        castEfficiency: {
          suggestion: this.selectedCombatant.owner.build === Build.DISC || this.selectedCombatant.owner.build === Build.HOLY,
          recommendedEfficiency: 0.75,
          extraSuggestion: 'You should use this as often as possible.',
        },
        buffSpellId: SPELLS.PRAYER_OF_MENDING_BUFF,
        healSpellIds: [SPELLS.PRAYER_OF_MENDING_HEAL],
        cooldown: 10,
      },
      {
        spell: [SPELLS.PRAYER_OF_HEALING, ...lowRankSpells[SPELLS.PRAYER_OF_HEALING]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.SHADOW_WORD_PAIN, ...lowRankSpells[SPELLS.SHADOW_WORD_PAIN]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MIND_BLAST, ...lowRankSpells[SPELLS.MIND_BLAST]],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 8,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.SHADOW_WORD_DEATH, ...lowRankSpells[SPELLS.SHADOW_WORD_DEATH]],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 12,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.SMITE, ...lowRankSpells[SPELLS.SMITE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.HOLY_FIRE, ...lowRankSpells[SPELLS.HOLY_FIRE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MANA_BURN],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.SHADOW_FIEND,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          static: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.75,
          extraSuggestion: 'You should use this any time you are below 70% mana.',
        },
        cooldown: 300,
      },
      {
        spell: [SPELLS.PSYCHIC_SCREAM, ...lowRankSpells[SPELLS.PSYCHIC_SCREAM]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.DISPEL_MAGIC, ...lowRankSpells[SPELLS.DISPEL_MAGIC]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.MASS_DISPEL,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.SHACKLE_UNDEAD, ...lowRankSpells[SPELLS.SHACKLE_UNDEAD]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MIND_SOOTHE, ...lowRankSpells[SPELLS.MIND_SOOTHE]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MIND_CONTROL],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MIND_VISION, ...lowRankSpells[SPELLS.MIND_VISION]],
        category: SPELL_CATEGORY.HIDDEN,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.LEVITATE,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.RESURRECTION, ...lowRankSpells[SPELLS.RESURRECTION]],
        category: SPELL_CATEGORY.HIDDEN,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.FADE],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.POWER_WORD_FORTITUDE, ...lowRankSpells[SPELLS.POWER_WORD_FORTITUDE]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.SHADOW_PROTECTION, ...lowRankSpells[SPELLS.SHADOW_PROTECTION]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.DIVINE_SPIRIT, ...lowRankSpells[SPELLS.DIVINE_SPIRIT]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.PRAYER_OF_FORTITUDE, ...lowRankSpells[SPELLS.PRAYER_OF_FORTITUDE]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.PRAYER_OF_SPIRIT, ...lowRankSpells[SPELLS.PRAYER_OF_SPIRIT]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [
          SPELLS.PRAYER_OF_SHADOW_PROTECTION,
          ...lowRankSpells[SPELLS.PRAYER_OF_SHADOW_PROTECTION],
        ],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.INNER_FIRE, ...lowRankSpells[SPELLS.INNER_FIRE]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.FEAR_WARD,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.HOLY_NOVA, ...lowRankSpells[SPELLS.HOLY_NOVA]],
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.LIGHTWELL, ...lowRankSpells[SPELLS.LIGHTWELL]],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.CIRCLE_OF_HEALING, ...lowRankSpells[SPELLS.CIRCLE_OF_HEALING]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
        cooldown: 6,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
          extraSuggestion: 'You should use this as often as possible.',
        },
        enabled: this.selectedCombatant.owner.build === Build.HOLY,
      },
      {
        spell: SPELLS.INNER_FOCUS,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
          extraSuggestion: 'You should use this as often as possible.',
        },
        enabled: this.selectedCombatant.owner.build === Build.DISC,
      },
      {
        spell: SPELLS.POWER_INFUSION,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          static: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
          extraSuggestion: 'You should use this as often as possible.',
        },
        enabled: this.selectedCombatant.owner.build === Build.DISC,
      },
      {
        spell: SPELLS.PAIN_SUPPRESSION,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          static: 1500,
        },
        enabled: this.selectedCombatant.owner.build === Build.DISC,
      },
      {
        spell: [SPELLS.PENANCE, ...lowRankSpells[SPELLS.PENANCE]],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          static: 1500,
        },
        enabled: this.selectedCombatant.owner.build === Build.DISC,
      },
      {
        spell: [SPELLS.PENANCE_HEALING, ...lowRankSpells[SPELLS.PENANCE_HEALING]],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          static: 1500,
        },
        enabled: this.selectedCombatant.owner.build === Build.DISC,
      },
      {
        spell: [SPELLS.PENANCE_DAMAGE, ...lowRankSpells[SPELLS.PENANCE_DAMAGE]],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          static: 1500,
        },
        enabled: this.selectedCombatant.owner.build === Build.DISC,
      },

      {
        spell: [SPELLS.MIND_FLAY, ...lowRankSpells[SPELLS.MIND_FLAY]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
        enabled: this.selectedCombatant.owner.build === Build.SHADOW,
      },
      {
        spell: SPELLS.SILENCE,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.VAMPIRIC_TOUCH, ...lowRankSpells[SPELLS.VAMPIRIC_TOUCH]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1500,
        },
        enabled: this.selectedCombatant.owner.build === Build.SHADOW,
      },
      {
        spell: SPELLS.SHADOW_FORM,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
        enabled: this.selectedCombatant.owner.build === Build.SHADOW,
      },
      {
        spell: SPELLS.SYMBOL_OF_HOPE,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 300,
        gcd: {
          static: 1500,
        },
        enabled: false,
      },
      {
        spell: [SPELLS.CHASTISE, ...lowRankSpells[SPELLS.CHASTISE]],
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          static: 1500,
        },
        enabled: false,
      },
      {
        spell: [SPELLS.DESPERATE_PRAYER, ...lowRankSpells[SPELLS.DESPERATE_PRAYER]],
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 600,
        gcd: {
          static: 1500,
        },
        enabled: true,
      },

      {
        spell: [SPELLS.TOUCH_OF_WEAKNESS, ...lowRankSpells[SPELLS.TOUCH_OF_WEAKNESS]],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1500,
        },
        enabled: false,
      },
      {
        spell: [SPELLS.DEVOURING_PLAGUE, ...lowRankSpells[SPELLS.DEVOURING_PLAGUE]],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 180,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.DIVINE_HYMN],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 480,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.HYMN_OF_HOPE],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 480,
        gcd: {
          static: 1500,
        },
        castEfficiency: {
          suggestion: this.selectedCombatant.owner.build === Build.DISC || this.selectedCombatant.owner.build === Build.HOLY,
          recommendedEfficiency: 0.6,
          extraSuggestion: 'You should use this as often as possible.',
        },
      },
      {
        spell: [SPELLS.GUARDIAN_SPIRIT],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          static: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.3,
          extraSuggestion: 'Save this cooldown for a tank, but make sure you still cast it!',
        },
        enabled: this.selectedCombatant.owner.build === Build.HOLY,
      },
    ];

    return baseSpells;
  }
}

export default Abilities;
