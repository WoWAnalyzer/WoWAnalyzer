import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';

import * as SPELLS from '../SPELLS';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const baseSpells: SpellbookAbility[] = [
      {
        spell: SPELLS.FLASH_HEAL,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
        lowerRanks: [25233, 10917, 10916, 10915, 9474, 9473, 9472, 2061],
      },
      {
        spell: SPELLS.GREATER_HEAL,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
        lowerRanks: [25210, 25314, 10965, 10964, 10963, 2060],
      },
      {
        spell: SPELLS.RENEW,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
        lowerRanks: [25221, 25315, 10929, 10928, 10927, 6078, 6077, 6076, 6075, 6074, 139],
      },
      {
        spell: SPELLS.POWER_WORD_SHIELD,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
        lowerRanks: [25217, 10901, 10900, 10899, 10898, 6066, 6065, 3747, 600, 592, 17],
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
        spell: SPELLS.PRAYER_OF_HEALING,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
        lowerRanks: [25316, 10961, 10960, 996, 596],
      },
      {
        spell: SPELLS.SHADOW_WORD_PAIN,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
        lowerRanks: [25367, 10894, 10893, 10892, 2767, 992, 970, 594, 589],
      },
      {
        spell: SPELLS.MIND_BLAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 8,
        gcd: {
          static: 1500,
        },
        lowerRanks: [25372, 10947, 10946, 10945, 8106, 8105, 8104, 8103, 8102, 8092],
      },
      {
        spell: SPELLS.SHADOW_WORD_DEATH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 12,
        gcd: {
          static: 1500,
        },
        lowerRanks: [32379],
      },
      {
        spell: SPELLS.SMITE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
        lowerRanks: [25363, 10934, 10933, 6060, 1004, 984, 598, 591, 585],
      },
      {
        spell: SPELLS.HOLY_FIRE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
        lowerRanks: [15261, 15267, 15266, 15265, 15264, 15263, 15262, 14914],
      },
      {
        spell: SPELLS.MANA_BURN,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [25379, 10876, 10875, 10874, 8131, 8129],
      },
      {
        spell: SPELLS.SHADOW_FIEND,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.PSYCHIC_SCREAM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [10888, 8124, 8122],
      },
      {
        spell: SPELLS.DISPEL_MAGIC,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [527],
      },
      {
        spell: SPELLS.MASS_DISPEL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.SHACKLE_UNDEAD,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [9485, 9484],
      },
      {
        spell: SPELLS.MIND_SOOTHE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [10953, 8192, 453],
      },
      {
        spell: SPELLS.MIND_CONTROL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [605, 10911],
      },
      {
        spell: SPELLS.MIND_VISION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [2096],
      },
      {
        spell: SPELLS.LEVITATE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.RESURRECTION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [20770, 10881, 10880, 2010, 2006],
      },
      {
        spell: SPELLS.FADE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [10942, 10941, 9592, 9579, 9578, 586],
      },
      {
        spell: SPELLS.POWER_WORD_FORTITUDE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [10938, 10937, 2791, 1245, 1244, 1243],
      },
      {
        spell: SPELLS.SHADOW_PROTECTION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [10958, 10957, 976],
      },
      {
        spell: SPELLS.DIVINE_SPIRIT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [27841, 14819, 14818, 14752],
      },
      {
        spell: SPELLS.PRAYER_OF_FORTITUDE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [21564, 21562],
      },
      {
        spell: SPELLS.PRAYER_OF_SPIRIT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [27681],
      },
      {
        spell: SPELLS.PRAYER_OF_SHADOW_PROTECTION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [27683],
      },
      {
        spell: SPELLS.INNER_FIRE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [10952, 10951, 1006, 602, 7128, 588],
      },
      {
        spell: SPELLS.FEAR_WARD,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.HOLY_NOVA,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          static: 1500,
        },
        lowerRanks: [27801, 27800, 27799, 15431, 15430, 15237],
      },
      {
        spell: SPELLS.LIGHTWELL,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: {
          static: 1500,
        },
        lowerRanks: [27871, 27870, 724],
      },
      {
        spell: SPELLS.CIRCLE_OF_HEALING,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
        lowerRanks: [34865, 34864, 34863, 34861],
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
        spell: SPELLS.MIND_FLAY,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
        lowerRanks: [18807, 17314, 17313, 17312, 17311, 15407],
      },
      {
        spell: SPELLS.SILENCE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.VAMPIRIC_TOUCH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500,
        },
        lowerRanks: [34916, 34914],
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
        spell: SPELLS.CHASTISE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          static: 1500,
        },
        lowerRanks: [44046, 44045, 44044, 44043, 44041],
      },
      {
        spell: SPELLS.DESPERATE_PRAYER,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 600,
        gcd: {
          static: 1500,
        },
        lowerRanks: [19243, 19242, 19241, 19240, 19238, 19236, 13908],
      },
      {
        spell: SPELLS.FEEDBACK,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 180,
        gcd: {
          static: 1500,
        },
        lowerRanks: [19275, 19274, 19273, 19271, 13896],
      },
      {
        spell: SPELLS.STAR_SHARDS,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
        lowerRanks: [19305, 19304, 19303, 19302, 19299, 19296, 10797],
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
        spell: SPELLS.TOUCH_OF_WEAKNESS,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [19266, 19265, 19264, 19262, 19261, 2652],
      },
      {
        spell: SPELLS.DEVOURING_PLAGUE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: {
          static: 1500,
        },
        lowerRanks: [19280, 19279, 19278, 19277, 19276, 2944],
      },
      {
        spell: SPELLS.SHADOW_GUARD,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [19312, 19311, 19310, 19309, 19308, 18137],
      },
      {
        spell: SPELLS.HEX_OF_WEAKNESS,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
        lowerRanks: [19285, 19284, 19283, 19282, 19281, 9035],
      },
    ];

    const downRankedSpells: SpellbookAbility[] = [];
    for (const spell of baseSpells) {
      if (spell.lowerRanks) {
        spell.lowerRanks.forEach((lowerRankId) => {
          const lowerRankSpell = {
            ...spell,
            spell: lowerRankId,
          };
          delete lowerRankSpell.lowerRanks;
          downRankedSpells.push(lowerRankSpell);
        });
      }
    }

    return baseSpells.concat(downRankedSpells);
    // return baseSpells;
  }
}

export default Abilities;
