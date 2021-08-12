import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';

import lowRankSpells from '../lowRankSpells';
import * as SPELLS from '../SPELLS';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const baseSpells: SpellbookAbility[] = [
      {
        spell: [SPELLS.FLASH_HEAL, ...lowRankSpells[SPELLS.FLASH_HEAL]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.GREATER_HEAL, ...lowRankSpells[SPELLS.GREATER_HEAL]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.RENEW, ...lowRankSpells[SPELLS.RENEW]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.POWER_WORD_SHIELD, ...lowRankSpells[SPELLS.POWER_WORD_SHIELD]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.BINDING_HEAL,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.PRAYER_OF_MENDING,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
        buffSpellId: SPELLS.PRAYER_OF_MENDING_BUFF,
        healSpellIds: [SPELLS.PRAYER_OF_MENDING_HEAL],
      },
      {
        spell: [SPELLS.PRAYER_OF_HEALING, ...lowRankSpells[SPELLS.PRAYER_OF_HEALING]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.SHADOW_WORD_PAIN, ...lowRankSpells[SPELLS.SHADOW_WORD_PAIN]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MIND_BLAST, ...lowRankSpells[SPELLS.MIND_BLAST]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 8,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.SHADOW_WORD_DEATH, ...lowRankSpells[SPELLS.SHADOW_WORD_DEATH]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 12,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.SMITE, ...lowRankSpells[SPELLS.SMITE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.HOLY_FIRE, ...lowRankSpells[SPELLS.HOLY_FIRE]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MANA_BURN, ...lowRankSpells[SPELLS.MANA_BURN]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.SHADOW_FIEND,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.PSYCHIC_SCREAM, ...lowRankSpells[SPELLS.PSYCHIC_SCREAM]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.DISPEL_MAGIC, ...lowRankSpells[SPELLS.DISPEL_MAGIC]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.MASS_DISPEL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.SHACKLE_UNDEAD, ...lowRankSpells[SPELLS.SHACKLE_UNDEAD]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MIND_SOOTHE, ...lowRankSpells[SPELLS.MIND_SOOTHE]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MIND_CONTROL, ...lowRankSpells[SPELLS.MIND_CONTROL]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MIND_VISION, ...lowRankSpells[SPELLS.MIND_VISION]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.LEVITATE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.RESURRECTION, ...lowRankSpells[SPELLS.RESURRECTION]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.FADE, ...lowRankSpells[SPELLS.FADE]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.POWER_WORD_FORTITUDE, ...lowRankSpells[SPELLS.POWER_WORD_FORTITUDE]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.SHADOW_PROTECTION, ...lowRankSpells[SPELLS.SHADOW_PROTECTION]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.DIVINE_SPIRIT, ...lowRankSpells[SPELLS.DIVINE_SPIRIT]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.PRAYER_OF_FORTITUDE, ...lowRankSpells[SPELLS.PRAYER_OF_FORTITUDE]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.PRAYER_OF_SPIRIT, ...lowRankSpells[SPELLS.PRAYER_OF_SPIRIT]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [
          SPELLS.PRAYER_OF_SHADOW_PROTECTION,
          ...lowRankSpells[SPELLS.PRAYER_OF_SHADOW_PROTECTION],
        ],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.INNER_FIRE, ...lowRankSpells[SPELLS.INNER_FIRE]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.FEAR_WARD,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.HOLY_NOVA, ...lowRankSpells[SPELLS.HOLY_NOVA]],
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.LIGHTWELL, ...lowRankSpells[SPELLS.LIGHTWELL]],
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.CIRCLE_OF_HEALING, ...lowRankSpells[SPELLS.CIRCLE_OF_HEALING]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.INNER_FOCUS,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      },
      {
        spell: SPELLS.POWER_INFUSION,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.PAIN_SUPPRESSION,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MIND_FLAY, ...lowRankSpells[SPELLS.MIND_FLAY]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.SILENCE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.VAMPIRIC_TOUCH, ...lowRankSpells[SPELLS.VAMPIRIC_TOUCH]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.SHADOW_FORM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.SYMBOL_OF_HOPE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 300,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.CHASTISE, ...lowRankSpells[SPELLS.CHASTISE]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.DESPERATE_PRAYER, ...lowRankSpells[SPELLS.DESPERATE_PRAYER]],
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 600,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.FEEDBACK, ...lowRankSpells[SPELLS.FEEDBACK]],
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 180,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.STAR_SHARDS, ...lowRankSpells[SPELLS.STAR_SHARDS]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
      },
      {
        spell: SPELLS.ELUNES_GRACE,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 180,
      },
      {
        spell: SPELLS.CONSUME_MAGIC,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.TOUCH_OF_WEAKNESS, ...lowRankSpells[SPELLS.TOUCH_OF_WEAKNESS]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.DEVOURING_PLAGUE, ...lowRankSpells[SPELLS.DEVOURING_PLAGUE]],
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.SHADOW_GUARD, ...lowRankSpells[SPELLS.SHADOW_GUARD]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.HEX_OF_WEAKNESS, ...lowRankSpells[SPELLS.HEX_OF_WEAKNESS]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
    ];

    return baseSpells;
  }
}

export default Abilities;
