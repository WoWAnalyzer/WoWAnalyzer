import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';

import lowRankSpells from '../lowRankSpells';
import * as SPELLS from '../SPELLS';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    return [
      {
        spell: SPELLS.ARCANE_BLAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
          minimum: 750, // 0.75 seconds or 1 second?
        },
      },
      {
        spell: SPELLS.ARCANE_EXPLOSION,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
          minimum: 1000, // is it actually 1 second for arcane explosion in classic?
        },
      },
      {
        spell: [SPELLS.FROSTBOLT, ...lowRankSpells[SPELLS.FROSTBOLT]],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1500, // haste interaction not accounted for
        },
      },
      {
        spell: [SPELLS.FIRE_BLAST, ...lowRankSpells[SPELLS.FIRE_BLAST]],
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: 8,
        gcd: {
          static: 1500, // haste interaction not accounted for
        },
      },
      {
        spell: SPELLS.ARCANE_POWER,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.ICY_VEINS,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.PRESENCE_OF_MIND,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: null,
      },
      {
        spell: SPELLS.COLD_SNAP,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 480,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: [SPELLS.MAGE_ARMOR, ...lowRankSpells[SPELLS.MAGE_ARMOR]],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.MOLTEN_ARMOR,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.EVOCATION,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 480,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.REMOVE_CURSE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1500,
        },
      },
      {
        spell: SPELLS.BADGE_ICON,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: null,
        cooldown: 120,
      },
      {
        spell: SPELLS.MANA_EMERALD,
        category: Abilities.SPELL_CATEGORIES.CONSUMABLE,
        gcd: null,
        cooldown: 120,
      },
    ];
  }
}

export default Abilities;
